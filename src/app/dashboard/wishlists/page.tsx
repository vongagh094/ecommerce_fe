"use client"

import Image from "next/image"
import { Heart, Star } from "lucide-react"

const wishlistItems = [
  {
    id: 1,
    location: "Entire home in Bordeaux",
    title: "Charming Waterfront Condo",
    details: "4-6 guests · Entire Home · 5 beds · 3 bath",
    amenities: "Wifi · Kitchen · Free Parking",
    rating: 5.0,
    reviewCount: 318,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    location: "Entire home in Bordeaux",
    title: "Bordeaux Getaway",
    details: "4-6 guests · Entire Home · 5 beds · 3 bath",
    amenities: "Wifi · Kitchen · Free Parking",
    rating: 5.0,
    reviewCount: 318,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function WishlistsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Your wishlists</h1>
      </div>

      <div className="space-y-8">
        {wishlistItems.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  width={200}
                  height={150}
                  className="rounded-xl object-cover"
                />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{item.location}</p>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                  </div>
                  <Heart className="h-6 w-6 text-rose-500 fill-current" />
                </div>

                <p className="text-gray-600 mb-2">{item.details}</p>
                <p className="text-gray-600 mb-4">{item.amenities}</p>

                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{item.rating}</span>
                  <span className="text-gray-600">({item.reviewCount} reviews)</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
