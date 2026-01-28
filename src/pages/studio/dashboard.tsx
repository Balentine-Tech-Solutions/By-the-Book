import { useState } from 'react'
import Head from 'next/head'
import { api } from '@/utils/api'
import { format } from 'date-fns'
import { Calendar, DollarSign, Users, Star, TrendingUp, Clock } from 'lucide-react'

export default function StudioDashboard() {
  // For demo purposes, using a hardcoded studio ID
  // In production, this would come from authentication
  const [selectedStudioId, setSelectedStudioId] = useState<string>('')

  const { data: studios } = api.studio.getAll.useQuery()
  const { data: studio } = api.studio.getById.useQuery(
    { id: selectedStudioId },
    { enabled: !!selectedStudioId }
  )
  const { data: stats } = api.studio.getStats.useQuery(
    { studioId: selectedStudioId },
    { enabled: !!selectedStudioId }
  )
  const { data: bookings } = api.booking.getByStudio.useQuery(
    { studioId: selectedStudioId },
    { enabled: !!selectedStudioId }
  )

  // Select first studio by default
  if (!selectedStudioId && studios && studios.length > 0) {
    setSelectedStudioId(studios[0]!.id)
  }

  return (
    <>
      <Head>
        <title>Studio Dashboard - By the Book</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Studio Dashboard</h1>
                {studio && <p className="text-gray-600 mt-1">{studio.name}</p>}
              </div>
              
              {studios && studios.length > 1 && (
                <select
                  value={selectedStudioId}
                  onChange={(e) => setSelectedStudioId(e.target.value)}
                  className="px-4 py-2 border rounded-lg"
                >
                  {studios.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                icon={<Calendar className="text-primary-600" />}
                title="Total Bookings"
                value={stats.totalBookings.toString()}
                trend="+12% this month"
              />
              <StatCard
                icon={<DollarSign className="text-green-600" />}
                title="Total Revenue"
                value={`$${stats.totalRevenue.toFixed(0)}`}
                trend="+8% this month"
              />
              <StatCard
                icon={<Clock className="text-blue-600" />}
                title="Upcoming Sessions"
                value={stats.upcomingBookings.toString()}
                trend="Next 30 days"
              />
              <StatCard
                icon={<Star className="text-yellow-600" />}
                title="Average Rating"
                value={stats.avgRating.toFixed(1)}
                trend="From all reviews"
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Bookings */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-2xl font-bold mb-6">Upcoming Bookings</h2>
                
                <div className="space-y-4">
                  {bookings
                    ?.filter((b) => new Date(b.startTime) >= new Date())
                    .slice(0, 10)
                    .map((booking) => (
                      <BookingCard key={booking.id} booking={booking} />
                    ))}
                  
                  {bookings?.filter((b) => new Date(b.startTime) >= new Date()).length === 0 && (
                    <p className="text-gray-500 text-center py-8">No upcoming bookings</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 text-left">
                    View All Bookings
                  </button>
                  <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                    Manage Availability
                  </button>
                  <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                    View Clients
                  </button>
                  <button className="w-full px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-left">
                    Studio Settings
                  </button>
                </div>
              </div>

              {/* Recent Reviews */}
              {studio?.reviews && studio.reviews.length > 0 && (
                <div className="bg-white rounded-xl shadow p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Reviews</h3>
                  <div className="space-y-4">
                    {studio.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="border-b pb-3 last:border-0">
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{review.comment}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {review.booking.client.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function StatCard({
  icon,
  title,
  value,
  trend,
}: {
  icon: React.ReactNode
  title: string
  value: string
  trend: string
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold mb-2">{value}</p>
      <p className="text-sm text-gray-500">{trend}</p>
    </div>
  )
}

function BookingCard({ booking }: { booking: any }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h4 className="font-semibold">{booking.client.name}</h4>
          <p className="text-sm text-gray-600">{booking.client.email}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Calendar size={16} />
          <span>{format(new Date(booking.startTime), 'MMM d, yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{format(new Date(booking.startTime), 'h:mm a')}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign size={16} />
          <span>${booking.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {booking.notes && (
        <p className="text-sm text-gray-500 mt-2 italic">"{booking.notes}"</p>
      )}
    </div>
  )
}
