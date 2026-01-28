import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const clientRouter = createTRPCRouter({
  // Get or create client
  getOrCreate: publicProcedure
    .input(
      z.object({
        studioId: z.string(),
        email: z.string().email(),
        name: z.string(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Try to find existing client
      let client = await ctx.prisma.client.findUnique({
        where: {
          email_studioId: {
            email: input.email,
            studioId: input.studioId,
          },
        },
      })

      // Create if doesn't exist
      if (!client) {
        client = await ctx.prisma.client.create({
          data: {
            studioId: input.studioId,
            email: input.email,
            name: input.name,
            phone: input.phone,
          },
        })
      }

      return client
    }),

  // Get client bookings
  getBookings: publicProcedure
    .input(
      z.object({
        clientId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.booking.findMany({
        where: { clientId: input.clientId },
        include: {
          studio: {
            select: {
              name: true,
              address: true,
              phone: true,
            },
          },
          room: true,
          services: {
            include: { service: true },
          },
          payments: true,
        },
        orderBy: { startTime: 'desc' },
      })
    }),

  // Submit review
  submitReview: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
      })

      if (!booking) throw new Error('Booking not found')
      if (booking.status !== 'COMPLETED') {
        throw new Error('Can only review completed bookings')
      }

      return ctx.prisma.review.create({
        data: {
          bookingId: input.bookingId,
          studioId: booking.studioId,
          rating: input.rating,
          comment: input.comment,
          isPublic: true,
        },
      })
    }),

  // Get all clients for a studio
  getByStudio: publicProcedure
    .input(z.object({ studioId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.client.findMany({
        where: { studioId: input.studioId },
        include: {
          _count: {
            select: { bookings: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      })
    }),
})
