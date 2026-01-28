import { useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { api } from '@/utils/api'
import { format, parseISO } from 'date-fns'

export default function BookSession() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [selectedStudio, setSelectedStudio] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null)
  const [duration, setDuration] = useState<number>(60)
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })

  const { data: studios } = api.studio.getAll.useQuery()
  const { data: studio } = api.studio.getById.useQuery(
    { id: selectedStudio },
    { enabled: !!selectedStudio }
  )
  const { data: availableSlots } = api.booking.getAvailableSlots.useQuery(
    {
      studioId: selectedStudio,
      date: selectedDate,
      duration: duration,
    },
    { enabled: !!selectedStudio && !!selectedDate }
  )

  const createClientMutation = api.client.getOrCreate.useMutation()
  const createBookingMutation = api.booking.create.useMutation()

  const handleSubmit = async () => {
    if (!selectedStudio || !selectedSlot) return

    try {
      // Create or get client
      const client = await createClientMutation.mutateAsync({
        studioId: selectedStudio,
        email: clientInfo.email,
        name: clientInfo.name,
        phone: clientInfo.phone,
      })

      // Create booking
      const booking = await createBookingMutation.mutateAsync({
        studioId: selectedStudio,
        clientId: client.id,
        startTime: selectedSlot.start,
        duration: duration,
        notes: clientInfo.notes,
      })

      // Redirect to payment page
      router.push(`/booking/${booking.id}/payment`)
    } catch (error) {
      console.error('Booking error:', error)
      alert('Failed to create booking. Please try again.')
    }
  }

  return (
    <>
      <Head>
        <title>Book a Session - By the Book</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {['Select Studio', 'Choose Time', 'Your Info', 'Confirm'].map((label, idx) => (
                <div key={label} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step > idx + 1
                        ? 'bg-green-500 text-white'
                        : step === idx + 1
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {step > idx + 1 ? '✓' : idx + 1}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden md:block">{label}</span>
                  {idx < 3 && <div className="w-12 h-0.5 bg-gray-300 mx-2 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8">
            {/* Step 1: Select Studio */}
            {step === 1 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Select a Studio</h2>
                <div className="grid gap-4">
                  {studios?.map((studio) => (
                    <button
                      key={studio.id}
                      onClick={() => {
                        setSelectedStudio(studio.id)
                        setStep(2)
                      }}
                      className="text-left p-6 border-2 border-gray-200 rounded-lg hover:border-primary-500 transition-colors"
                    >
                      <h3 className="text-xl font-semibold mb-2">{studio.name}</h3>
                      {studio.description && (
                        <p className="text-gray-600 mb-2">{studio.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>${studio.hourlyRate}/hour</span>
                        {studio._count.reviews > 0 && (
                          <span>{studio._count.reviews} reviews</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Choose Time */}
            {step === 2 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Choose Your Time</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Session Duration</label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={180}>3 hours</option>
                    <option value={240}>4 hours</option>
                    <option value={480}>Full day (8 hours)</option>
                  </select>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {selectedDate && (
                  <div>
                    <h3 className="font-semibold mb-4">Available Time Slots</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {availableSlots?.length === 0 ? (
                        <p className="col-span-full text-gray-500 text-center py-8">
                          No available slots for this date
                        </p>
                      ) : (
                        availableSlots?.map((slot) => (
                          <button
                            key={slot.startTime.toString()}
                            onClick={() => {
                              setSelectedSlot({
                                start: slot.startTime.toString(),
                                end: slot.endTime.toString(),
                              })
                              setStep(3)
                            }}
                            className="px-4 py-3 border-2 border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors"
                          >
                            {format(parseISO(slot.startTime.toString()), 'h:mm a')}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setStep(1)}
                  className="mt-6 px-6 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              </div>
            )}

            {/* Step 3: Client Info */}
            {step === 3 && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Your Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name *</label>
                    <input
                      type="text"
                      value={clientInfo.name}
                      onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Email *</label>
                    <input
                      type="email"
                      value={clientInfo.email}
                      onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Phone</label>
                    <input
                      type="tel"
                      value={clientInfo.phone}
                      onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={clientInfo.notes}
                      onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg"
                      rows={4}
                      placeholder="Any special requirements or notes for the studio..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    disabled={!clientInfo.name || !clientInfo.email}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Confirm */}
            {step === 4 && studio && selectedSlot && (
              <div>
                <h2 className="text-3xl font-bold mb-6">Confirm Your Booking</h2>
                
                <div className="bg-gray-50 p-6 rounded-lg mb-6 space-y-3">
                  <div>
                    <span className="font-semibold">Studio:</span> {studio.name}
                  </div>
                  <div>
                    <span className="font-semibold">Date:</span>{' '}
                    {format(parseISO(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
                  </div>
                  <div>
                    <span className="font-semibold">Time:</span>{' '}
                    {format(parseISO(selectedSlot.start), 'h:mm a')} -{' '}
                    {format(parseISO(selectedSlot.end), 'h:mm a')}
                  </div>
                  <div>
                    <span className="font-semibold">Duration:</span> {duration / 60} hour(s)
                  </div>
                  <div>
                    <span className="font-semibold">Rate:</span> ${studio.hourlyRate}/hour
                  </div>
                  <div className="text-xl font-bold pt-3 border-t">
                    Total: ${((duration / 60) * studio.hourlyRate).toFixed(2)}
                  </div>
                  {studio.requireDeposit && (
                    <div className="text-sm text-gray-600">
                      Deposit required: $
                      {studio.depositType === 'PERCENTAGE'
                        ? (
                            ((duration / 60) * studio.hourlyRate * studio.depositAmount) /
                            100
                          ).toFixed(2)
                        : studio.depositAmount.toFixed(2)}
                    </div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(3)}
                    className="px-6 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={createBookingMutation.isLoading}
                    className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 font-semibold text-lg"
                  >
                    {createBookingMutation.isLoading ? 'Creating...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
