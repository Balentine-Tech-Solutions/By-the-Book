import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import { addMinutes, parseISO, isWithinInterval, isBefore, isAfter } from 'date-fns'

export const bookingRouter = createTRPCRouter({
  // Get available time slots for a studio
  getAvailableSlots: publicProcedure
    .input(
      z.object({
        studioId: z.string(),
        roomId: z.string().optional(),
        date: z.string(), // ISO date string
        duration: z.number().min(30), // minutes
      })
    )
    .query(async ({ ctx, input }) => {
      const studio = await ctx.prisma.studio.findUnique({
        where: { id: input.studioId },
        include: {
          availability: true,
          bookings: {
            where: {
              startTime: {
                gte: new Date(input.date),
                lt: new Date(new Date(input.date).getTime() + 24 * 60 * 60 * 1000),
              },
              status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
              ...(input.roomId && { roomId: input.roomId }),
            },
          },
        },
      })

      if (!studio) throw new Error('Studio not found')

      const requestedDate = parseISO(input.date)
      const dayOfWeek = requestedDate.getDay()

      // Get availability for this day
      const dayAvailability = studio.availability.filter(
        (slot) => slot.dayOfWeek === dayOfWeek && slot.isAvailable
      )

      if (dayAvailability.length === 0) {
        return []
      }

      // Generate time slots
      const availableSlots: Array<{ startTime: Date; endTime: Date }> = []

      for (const slot of dayAvailability) {
        const [startHour, startMin] = slot.startTime.split(':').map(Number)
        const [endHour, endMin] = slot.endTime.split(':').map(Number)

        let currentSlot = new Date(requestedDate)
        currentSlot.setHours(startHour!, startMin!, 0, 0)

        const slotEnd = new Date(requestedDate)
        slotEnd.setHours(endHour!, endMin!, 0, 0)

        // Generate slots with buffer time
        while (currentSlot < slotEnd) {
          const slotEndTime = addMinutes(currentSlot, input.duration)

          if (slotEndTime <= slotEnd) {
            // Check if this slot conflicts with existing bookings
            const hasConflict = studio.bookings.some((booking) => {
              const bookingStart = new Date(booking.startTime)
              const bookingEnd = new Date(booking.endTime)

              // Add buffer time before and after booking
              const bufferedStart = addMinutes(bookingStart, -studio.bookingBuffer)
              const bufferedEnd = addMinutes(bookingEnd, studio.bookingBuffer)

              return (
                isWithinInterval(currentSlot, { start: bufferedStart, end: bufferedEnd }) ||
                isWithinInterval(slotEndTime, { start: bufferedStart, end: bufferedEnd }) ||
                (isBefore(currentSlot, bufferedStart) && isAfter(slotEndTime, bufferedEnd))
              )
            })

            if (!hasConflict && slotEndTime > new Date()) {
              availableSlots.push({
                startTime: new Date(currentSlot),
                endTime: slotEndTime,
              })
            }
          }

          // Move to next slot (30-minute intervals)
          currentSlot = addMinutes(currentSlot, 30)
        }
      }

      return availableSlots
    }),

  // Create a new booking
  create: publicProcedure
    .input(
      z.object({
        studioId: z.string(),
        clientId: z.string(),
        roomId: z.string().optional(),
        startTime: z.string(),
        duration: z.number().min(30),
        serviceIds: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const studio = await ctx.prisma.studio.findUnique({
        where: { id: input.studioId },
        include: { services: true },
      })

      if (!studio) throw new Error('Studio not found')

      const startTime = parseISO(input.startTime)
      const endTime = addMinutes(startTime, input.duration)

      // Check for conflicts
      const conflicts = await ctx.prisma.booking.findMany({
        where: {
          studioId: input.studioId,
          ...(input.roomId && { roomId: input.roomId }),
          status: { in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS'] },
          OR: [
            {
              startTime: { lte: startTime },
              endTime: { gt: startTime },
            },
            {
              startTime: { lt: endTime },
              endTime: { gte: endTime },
            },
          ],
        },
      })

      if (conflicts.length > 0) {
        throw new Error('Time slot not available')
      }

      // Calculate pricing
      let totalAmount = (input.duration / 60) * studio.hourlyRate

      if (input.serviceIds && input.serviceIds.length > 0) {
        const services = studio.services.filter((s) =>
          input.serviceIds!.includes(s.id)
        )
        totalAmount += services.reduce((sum, service) => sum + service.price, 0)
      }

      const depositAmount =
        studio.requireDeposit
          ? studio.depositType === 'PERCENTAGE'
            ? (totalAmount * studio.depositAmount) / 100
            : studio.depositAmount
          : 0

      // Create booking
      const booking = await ctx.prisma.booking.create({
        data: {
          studioId: input.studioId,
          clientId: input.clientId,
          roomId: input.roomId,
          startTime,
          endTime,
          duration: input.duration,
          totalAmount,
          depositAmount,
          notes: input.notes,
          status: studio.requireDeposit ? 'PENDING' : 'CONFIRMED',
        },
      })

      // Add services if provided
      if (input.serviceIds && input.serviceIds.length > 0) {
        const services = studio.services.filter((s) =>
          input.serviceIds!.includes(s.id)
        )

        await ctx.prisma.bookingService.createMany({
          data: services.map((service) => ({
            bookingId: booking.id,
            serviceId: service.id,
            price: service.price,
          })),
        })
      }

      return booking
    }),

  // Get bookings for a studio
  getByStudio: publicProcedure
    .input(
      z.object({
        studioId: z.string(),
        status: z
          .enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'])
          .optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.booking.findMany({
        where: {
          studioId: input.studioId,
          ...(input.status && { status: input.status }),
          ...(input.startDate && {
            startTime: { gte: parseISO(input.startDate) },
          }),
          ...(input.endDate && {
            endTime: { lte: parseISO(input.endDate) },
          }),
        },
        include: {
          client: true,
          room: true,
          services: {
            include: { service: true },
          },
          payments: true,
        },
        orderBy: { startTime: 'asc' },
      })
    }),

  // Update booking status
  updateStatus: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        status: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']),
        internalNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.booking.update({
        where: { id: input.bookingId },
        data: {
          status: input.status,
          internalNotes: input.internalNotes,
          ...(input.status === 'CANCELLED' && {
            cancelledAt: new Date(),
          }),
        },
      })
    }),

  // Cancel booking
  cancel: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: { studio: true },
      })

      if (!booking) throw new Error('Booking not found')

      const hoursUntilBooking =
        (new Date(booking.startTime).getTime() - Date.now()) / (1000 * 60 * 60)

      const shouldChargeCancellationFee =
        hoursUntilBooking < booking.studio.cancellationHours

      return ctx.prisma.booking.update({
        where: { id: input.bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          internalNotes: `Cancelled: ${input.reason || 'No reason provided'}. ${
            shouldChargeCancellationFee
              ? `Cancellation fee applies (${booking.studio.cancellationFee}%)`
              : 'No cancellation fee'
          }`,
        },
      })
    }),
})
