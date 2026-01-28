import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { api } from '@/utils/api'
import { Star } from 'lucide-react'

export default function ReviewPage() {
  const router = useRouter()
  const { id } = router.query
  const bookingId = id as string

  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')

  const submitReviewMutation = api.client.submitReview.useMutation()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert('Please select a rating')
      return
    }

    try {
      await submitReviewMutation.mutateAsync({
        bookingId,
        rating,
        comment,
      })

      alert('Thank you for your feedback!')
      router.push('/')
    } catch (error) {
      alert('Failed to submit review. This booking may not be eligible for review.')
    }
  }

  return (
    <>
      <Head>
        <title>Leave a Review - By the Book</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6">How was your session?</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-lg font-medium mb-4">Your Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={48}
                        className={
                          star <= (hoveredRating || rating)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="mt-2 text-gray-600">
                    {rating === 1 && 'Poor'}
                    {rating === 2 && 'Fair'}
                    {rating === 3 && 'Good'}
                    {rating === 4 && 'Very Good'}
                    {rating === 5 && 'Excellent'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-lg font-medium mb-2">
                  Your Feedback (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg"
                  rows={6}
                  placeholder="Tell us about your experience..."
                />
                <p className="text-sm text-gray-500 mt-2">
                  Your review may be displayed publicly to help other clients
                </p>
              </div>

              <button
                type="submit"
                disabled={submitReviewMutation.isLoading || rating === 0}
                className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold text-lg"
              >
                {submitReviewMutation.isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
