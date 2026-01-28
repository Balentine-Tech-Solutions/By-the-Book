import { createTRPCRouter } from './trpc'
import { studioRouter } from './routers/studio'
import { bookingRouter } from './routers/booking'
import { clientRouter } from './routers/client'
import { paymentRouter } from './routers/payment'

export const appRouter = createTRPCRouter({
  studio: studioRouter,
  booking: bookingRouter,
  client: clientRouter,
  payment: paymentRouter,
})

export type AppRouter = typeof appRouter
