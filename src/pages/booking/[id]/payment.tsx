import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { api } from '@/utils/api'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { format } from 'date-fns'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

export default function PaymentPage() {
  const router = useRouter()
  const { id } = router.query
  const bookingId = id as string

  const [clientSecret, setClientSecret] = useState<string>('')
  const [paymentId, setPaymentId] = useState<string>('')

  const { data: booking } = api.booking.getByStudio.useQuery(
    { studioId: '' },
    { enabled: false }
  )

  const createPaymentMutation = api.payment.createPaymentIntent.useMutation()

  useEffect(() => {
    if (!bookingId) return

    createPaymentMutation.mutate(
      {
        bookingId,
        paymentType: 'DEPOSIT',
      },
      {
        onSuccess: (data) => {
          setClientSecret(data.clientSecret!)
          setPaymentId(data.paymentId)
        },
      }
    )
  }, [bookingId])

  return (
    <>
      <Head>
        <title>Payment - By the Book</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6">Complete Your Payment</h1>

            {clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm paymentId={paymentId} bookingId={bookingId} />
              </Elements>
            )}

            {createPaymentMutation.isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Preparing payment...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function CheckoutForm({ paymentId, bookingId }: { paymentId: string; bookingId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>('')

  const confirmPaymentMutation = api.payment.confirmPayment.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage('')

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      setErrorMessage(error.message || 'Payment failed')
      setIsProcessing(false)
      return
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      await confirmPaymentMutation.mutateAsync({
        paymentId,
        stripePaymentIntentId: paymentIntent.id,
      })

      router.push(`/booking/${bookingId}/confirmation`)
    }

    setIsProcessing(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
      >
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>

      <p className="text-sm text-gray-500 text-center">
        Your payment is secure and encrypted
      </p>
    </form>
  )
}
