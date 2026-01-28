import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>By the Book - Studio Booking Made Simple</title>
        <meta name="description" content="Professional recording studio booking and management platform" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-gray-900 mb-6">
              By the Book
            </h1>
            <p className="text-2xl text-gray-600 mb-8">
              Studio Booking Made Simple
            </p>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
              Streamline your recording studio operations with smart scheduling, 
              seamless payments, and automated client management.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Link 
                href="/studio/dashboard"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-lg font-semibold"
              >
                Studio Dashboard
              </Link>
              <Link 
                href="/book"
                className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-lg font-semibold"
              >
                Book a Session
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard 
              icon="📅"
              title="Smart Scheduling"
              description="AI-powered scheduling that prevents double-bookings and optimizes studio time"
            />
            <FeatureCard 
              icon="💳"
              title="Secure Payments"
              description="Integrated Stripe payments with deposit management and automated invoicing"
            />
            <FeatureCard 
              icon="⭐"
              title="Client Feedback"
              description="Collect reviews and feedback to improve your services and build reputation"
            />
            <FeatureCard 
              icon="🔔"
              title="Automated Reminders"
              description="Reduce no-shows with automatic email and SMS reminders"
            />
            <FeatureCard 
              icon="📊"
              title="Analytics Dashboard"
              description="Track bookings, revenue, and client trends with comprehensive analytics"
            />
            <FeatureCard 
              icon="⚡"
              title="Instant Confirmations"
              description="Eliminate back-and-forth with instant booking confirmations"
            />
          </div>

          {/* Stats Section */}
          <div className="mt-20 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">
              Built for Studios Without Complex Booking Systems
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <StatCard number="80%" label="Less Admin Time" />
              <StatCard number="60%" label="Fewer No-Shows" />
              <StatCard number="2x" label="More Bookings" />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-md">
      <div className="text-4xl font-bold text-primary-600 mb-2">{number}</div>
      <div className="text-gray-600">{label}</div>
    </div>
  )
}
