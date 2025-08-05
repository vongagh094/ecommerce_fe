"use client"

import { useState } from "react"
import { Star, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReviewSummary } from "@/types"

interface PropertyReviewsProps {
  reviews: ReviewSummary
  propertyId: string
}

export function PropertyReviews({ reviews, propertyId }: PropertyReviewsProps) {
  const [showAllReviews, setShowAllReviews] = useState(false)
  
  if (!reviews || reviews.total_reviews === 0) {
    return (
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h3>
        <p className="text-gray-500">No reviews yet. Be the first to review this property!</p>
      </div>
    )
  }

  const displayReviews = showAllReviews 
    ? reviews.recent_reviews 
    : reviews.recent_reviews.slice(0, 6)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="border-t pt-8">
      {/* Reviews Header */}
      <div className="flex items-center space-x-2 mb-6">
        <Star className="h-5 w-5 fill-current text-gray-900" />
        <h3 className="text-lg font-semibold text-gray-900">
          {reviews.average_rating} · {reviews.total_reviews} reviews
        </h3>
      </div>

      {/* Rating Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {Object.entries(reviews.rating_breakdown).map(([category, rating]) => (
          <div key={category} className="flex items-center justify-between">
            <span className="text-sm text-gray-600 capitalize">
              {category.replace('_', ' ')}
            </span>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-3 w-3 ${
                      star <= rating
                        ? 'fill-current text-gray-900'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-900">{rating}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Individual Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayReviews.map((review) => (
          <div key={review.id} className="space-y-3">
            {/* Reviewer Info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={review.reviewer.profile_image_url} 
                  alt={review.reviewer.full_name}
                />
                <AvatarFallback>
                  {getInitials(review.reviewer.full_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">
                  {review.reviewer.full_name}
                </p>
                <p className="text-sm text-gray-600">
                  {formatDate(review.created_at)}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= review.rating
                      ? 'fill-current text-gray-900'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Review Text */}
            <p className="text-gray-700 text-sm leading-relaxed">
              {review.review_text}
            </p>

            {/* Host Response */}
            {review.response_text && (
              <div className="bg-gray-50 p-3 rounded-lg mt-3">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Response from host:
                </p>
                <p className="text-sm text-gray-700">
                  {review.response_text}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More Button */}
      {reviews.recent_reviews.length > 6 && !showAllReviews && (
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => setShowAllReviews(true)}
            className="border-gray-900 text-gray-900 hover:bg-gray-50"
          >
            Show all {reviews.total_reviews} reviews
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </div>
      )}

      {/* Show All Reviews Link */}
      {reviews.total_reviews > reviews.recent_reviews.length && (
        <div className="mt-8">
          <Button
            variant="outline"
            onClick={() => {
              // Navigate to dedicated reviews page
              window.open(`/property/${propertyId}/reviews`, '_blank')
            }}
            className="border-gray-900 text-gray-900 hover:bg-gray-50"
          >
            View all {reviews.total_reviews} reviews
          </Button>
        </div>
      )}
    </div>
  )
}