"use client"

import { Star, Share, Heart, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PropertyHeaderProps {
  title: string
  rating: string
  reviewCount: number
  location: string
  isSuperhost?: boolean
}

export function PropertyHeader({ 
  title, 
  rating, 
  reviewCount, 
  location, 
  isSuperhost = false 
}: PropertyHeaderProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: title,
        url: window.location.href,
      })
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      // You could show a toast notification here
    }
  }

  const handleSave = () => {
    // TODO: Implement save to wishlist functionality
    console.log('Save property to wishlist')
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col space-y-4">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
          {title}
        </h1>

        {/* Rating, Location, and Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-current text-gray-900" />
              <span className="font-medium text-gray-900">
                {rating}
              </span>
              <span className="text-gray-600">
                ({reviewCount} reviews)
              </span>
              {isSuperhost && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                  Superhost
                </span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center space-x-1 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="underline hover:no-underline cursor-pointer">
                {location}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <Share className="h-4 w-4" />
              <span className="hidden md:inline">Share</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <Heart className="h-4 w-4" />
              <span className="hidden md:inline">Save</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}