import { z } from 'zod'
import { createTRPCRouter, publicProcedure } from '../trpc'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export const paymentRouter = createTRPCRouter({
  // Create payment intent for deposit
  createPaymentIntent: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        paymentType: z.enum(['DEPOSIT', 'FINAL', 'FULL']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const booking = await ctx.prisma.booking.findUnique({
        where: { id: input.bookingId },
        include: {
          studio: true,
          client: true,
        },
      })

      if (!booking) throw new Error('Booking not found')

      let amount = 0
      if (input.paymentType === 'DEPOSIT') {
        amount = booking.depositAmount || 0
      } else if (input.paymentType === 'FINAL') {
        amount = booking.totalAmount - (booking.depositAmount || 0)
      } else {
        amount = booking.totalAmount
      }

      // Create Stripe payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          bookingId: booking.id,
          studioId: booking.studioId,
          clientEmail: booking.client.email,
          paymentType: input.paymentType,
        },
      })

      // Create payment record
      const payment = await ctx.prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount,
          paymentType: input.paymentType,
          status: 'PENDING',
          stripePaymentIntentId: paymentIntent.id,
        },
      })

      return {
        clientSecret: paymentIntent.client_secret,
        paymentId: payment.id,
      }
    }),

  // Confirm payment
  confirmPayment: publicProcedure
    .input(
      z.object({
        paymentId: z.string(),
        stripePaymentIntentId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input.paymentId },
        include: { booking: true },
      })

      if (!payment) throw new Error('Payment not found')

      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(
        input.stripePaymentIntentId
      )

      if (paymentIntent.status === 'succeeded') {
        // Update payment status
        await ctx.prisma.payment.update({
          where: { id: input.paymentId },
          data: {
            status: 'SUCCEEDED',
            stripeChargeId: paymentIntent.latest_charge as string,
          },
        })

        // Update booking status if deposit paid
        if (payment.paymentType === 'DEPOSIT') {
          await ctx.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
              depositPaid: true,
              status: 'CONFIRMED',
            },
          })
        } else if (payment.paymentType === 'FINAL' || payment.paymentType === 'FULL') {
          await ctx.prisma.booking.update({
            where: { id: payment.bookingId },
            data: {
              finalPaid: true,
            },
          })
        }

        return { success: true }
      }

      return { success: false }
    }),

  // Get payment history for a booking
  getByBooking: publicProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.payment.findMany({
        where: { bookingId: input.bookingId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  // Refund payment
  refund: publicProcedure
    .input(
      z.object({
        paymentId: z.string(),
        amount: z.number().optional(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const payment = await ctx.prisma.payment.findUnique({
        where: { id: input.paymentId },
      })

      if (!payment || !payment.stripeChargeId) {
        throw new Error('Payment not found or not charged')
      }

      // Create refund in Stripe
      const refund = await stripe.refunds.create({
        charge: payment.stripeChargeId,
        amount: input.amount ? Math.round(input.amount * 100) : undefined,
        reason: 'requested_by_customer',
      })

      // Update payment status
      await ctx.prisma.payment.update({
        where: { id: input.paymentId },
        data: { status: 'REFUNDED' },
      })

      return refund
    }),
})
