import { Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

interface Review {
  rating: number
  count: number
  breakdown: {
    cleanliness: number
    accuracy: number
    location: number
    checkin: number
    communication: number
    value: number
  }
}

interface PropertyReviewsProps {
  reviews: Review
}

const sampleReviews = [
  {
    id: 1,
    user: { name: "Jose", avatar: "/placeholder.svg?height=40&width=40", date: "December 2021" },
    comment: "Host was very attentive.",
    rating: 5,
  },
  {
    id: 2,
    user: { name: "Luke", avatar: "/placeholder.svg?height=40&width=40", date: "December 2021" },
    comment: "Nice place to stay!",
    rating: 5,
  },
  {
    id: 3,
    user: { name: "Shayna", avatar: "/placeholder.svg?height=40&width=40", date: "November 2021" },
    comment:
      "Wonderful neighbourhood, easy access to restaurants and the historic city centre. Pretty apartment with a large comfortable bed. Great hosts, super helpful and responsive. Cool friendly feel.",
    rating: 5,
  },
  {
    id: 4,
    user: { name: "Josh", avatar: "/placeholder.svg?height=40&width=40", date: "November 2021" },
    comment: "Well designed and fun space, neighbourhood has lots of energy and amenities.",
    rating: 5,
  },
]

export function PropertyReviews({ reviews }: PropertyReviewsProps) {
  return (
    <div className="border-t pt-8">
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Write your review</h3>

        {/* Rating Selection */}
        <div className="flex items-center mb-4">
          <span className="mr-3 text-gray-700">Your rating:</span>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    // onClick={() => setSelectedRating(star)}
                    className="focus:outline-none"
                >
                  <Star
                      className={`h-6 w-6 ${star <= 4 ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                  />
                </button>
            ))}
          </div>
        </div>

        {/* Review Textarea */}
        <textarea
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            // rows="4"
            placeholder="Share your experience..."
            // value={reviewText}
            // onChange={(e) => setReviewText(e.target.value)}
        />

        {/* Submit Button */}
        <button
            className="mt-4 px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors"
            // onClick={handleSubmitReview}
        >
          Submit Review
        </button>
      </div>
      <div className="flex items-center space-x-2 mb-8">
        <Star className="h-5 w-5 fill-current text-gray-900" />
        <span className="text-xl font-semibold">
          {reviews.rating} · {reviews.count} reviews
        </span>
      </div>

      {/* Review Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Cleanliness</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-1 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-900 rounded"
                  style={{ width: `${(reviews.breakdown.cleanliness / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{reviews.breakdown.cleanliness}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Communication</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-1 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-900 rounded"
                  style={{ width: `${(reviews.breakdown.communication / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{reviews.breakdown.communication}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Check-in</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-1 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-900 rounded"
                  style={{ width: `${(reviews.breakdown.checkin / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{reviews.breakdown.checkin}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Accuracy</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-1 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-900 rounded"
                  style={{ width: `${(reviews.breakdown.accuracy / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{reviews.breakdown.accuracy}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Location</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-1 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-900 rounded"
                  style={{ width: `${(reviews.breakdown.location / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{reviews.breakdown.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Value</span>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-1 bg-gray-200 rounded">
                <div
                  className="h-full bg-gray-900 rounded"
                  style={{ width: `${(reviews.breakdown.value / 5) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium">{reviews.breakdown.value}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {sampleReviews.map((review) => (
          <div key={review.id} className="space-y-3">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={review.user.avatar || "/placeholder.svg"} alt={review.user.name} />
                <AvatarFallback>{review.user.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                <p className="text-sm text-gray-600">{review.user.date}</p>
              </div>
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <Button variant="outline">Show all 11 reviews</Button>
      </div>
    </div>
  )
}
