import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function ConfirmationPage() {
  const router = useRouter()
  const { id } = router.query

  return (
    <>
      <Head>
        <title>Booking Confirmed - By the Book</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            </div>

            <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
            
            <p className="text-lg text-gray-600 mb-8">
              Your session has been booked successfully. You will receive a confirmation email shortly.
            </p>

            <div className="bg-primary-50 p-6 rounded-lg mb-8">
              <h2 className="font-semibold mb-2">What's Next?</h2>
              <ul className="text-left space-y-2 text-gray-700">
                <li>✓ Check your email for booking details</li>
                <li>✓ You'll receive a reminder 24 hours before your session</li>
                <li>✓ Arrive 10 minutes early to set up</li>
                <li>✓ Bring any equipment or materials you need</li>
              </ul>
            </div>

            <div className="space-y-4">
              <Link
                href="/"
                className="block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-semibold"
              >
                Back to Home
              </Link>
              
              <Link
                href="/book"
                className="block px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 font-semibold"
              >
                Book Another Session
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
