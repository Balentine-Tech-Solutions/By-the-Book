import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'

export const studioRouter = createTRPCRouter({
  // Get all studios
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.studio.findMany({
      include: {
        owner: {
          select: { name: true, email: true },
        },
        rooms: true,
        services: true,
        _count: {
          select: { bookings: true, reviews: true },
        },
      },
    })
  }),

  // Get studio by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.studio.findUnique({
        where: { id: input.id },
        include: {
          rooms: true,
          services: true,
          availability: true,
          reviews: {
            where: { isPublic: true },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              booking: {
                select: {
                  client: {
                    select: { name: true },
                  },
                },
              },
            },
          },
        },
      })
    }),

  // Create new studio
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email(),
        ownerId: z.string(),
        hourlyRate: z.number().min(0).default(100),
        timezone: z.string().default('America/New_York'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.studio.create({
        data: input,
      })
    }),

  // Update studio
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().email().optional(),
        hourlyRate: z.number().min(0).optional(),
        bookingBuffer: z.number().min(0).optional(),
        minBookingTime: z.number().min(0).optional(),
        maxBookingTime: z.number().min(0).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      return ctx.prisma.studio.update({
        where: { id },
        data,
      })
    }),

  // Set studio availability
  setAvailability: publicProcedure
    .input(
      z.object({
        studioId: z.string(),
        availability: z.array(
          z.object({
            dayOfWeek: z.number().min(0).max(6),
            startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
            isAvailable: z.boolean().default(true),
          })
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Delete existing availability
      await ctx.prisma.studioAvailability.deleteMany({
        where: { studioId: input.studioId },
      })

      // Create new availability
      return ctx.prisma.studioAvailability.createMany({
        data: input.availability.map((slot) => ({
          studioId: input.studioId,
          ...slot,
        })),
      })
    }),

  // Get studio statistics
  getStats: publicProcedure
    .input(z.object({ studioId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [totalBookings, totalRevenue, avgRating, upcomingBookings] =
        await Promise.all([
          ctx.prisma.booking.count({
            where: { studioId: input.studioId },
          }),
          ctx.prisma.payment.aggregate({
            where: {
              booking: { studioId: input.studioId },
              status: 'SUCCEEDED',
            },
            _sum: { amount: true },
          }),
          ctx.prisma.review.aggregate({
            where: { studioId: input.studioId },
            _avg: { rating: true },
          }),
          ctx.prisma.booking.count({
            where: {
              studioId: input.studioId,
              startTime: { gte: new Date() },
              status: { in: ['CONFIRMED', 'PENDING'] },
            },
          }),
        ])

      return {
        totalBookings,
        totalRevenue: totalRevenue._sum.amount ?? 0,
        avgRating: avgRating._avg.rating ?? 0,
        upcomingBookings,
      }
    }),
})
