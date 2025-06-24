"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Star } from "lucide-react"
import Link from "next/link"

const searchResults = [
  {
    id: 1,
    title: "Bordeaux Getaway",
    type: "Entire home in Bordeaux",
    guests: "4-6 guests",
    details: "Entire Home · 5 beds · 3 bath",
    amenities: "Wifi · Kitchen · Free Parking",
    rating: 5.0,
    reviewCount: 318,
    price: 8125000, // Changed from 325 to VND equivalent
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
  },
  {
    id: 2,
    title: "Charming Waterfront Condo",
    type: "Entire home in Bordeaux",
    guests: "4-6 guests",
    details: "Entire Home · 5 beds · 3 bath",
    amenities: "Wifi · Kitchen · Free Parking",
    rating: 5.0,
    reviewCount: 318,
    price: 5000000, // Changed from 200 to VND equivalent
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: true,
  },
  {
    id: 3,
    title: "Historic City Center Home",
    type: "Entire home in Bordeaux",
    guests: "4-6 guests",
    details: "Entire Home · 5 beds · 3 bath",
    amenities: "Wifi · Kitchen · Free Parking",
    rating: 5.0,
    reviewCount: 318,
    price: 4500000, // Changed from 180 to VND equivalent
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
  },
]

interface SearchResultsListProps {
  filters: any
}

export function SearchResultsList({ filters }: SearchResultsListProps) {
  const [favorites, setFavorites] = useState<number[]>([2])

  const toggleFavorite = (propertyId: number) => {
    setFavorites((prev) => (prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]))
  }

  return (
    <div className="py-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900">200+ stays in Bordeaux</h2>
      </div>

      <div className="space-y-8">
        {searchResults.map((property) => (
          <div key={property.id} className="group">
            <Link href={`/property/${property.id}`} className="flex space-x-4">
              <div className="relative w-80 h-60 flex-shrink-0">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.title}
                  fill
                  className="object-cover rounded-xl group-hover:brightness-90 transition-all"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation() // Add this line to prevent event bubbling
                    toggleFavorite(property.id)
                  }}
                  className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      favorites.includes(property.id) ? "fill-rose-500 text-rose-500" : "fill-black/50 text-white"
                    }`}
                  />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <p className="text-sm text-gray-600">{property.type}</p>
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:underline">{property.title}</h3>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <p>{property.details}</p>
                  <p>{property.amenities}</p>
                </div>

                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-gray-900" />
                  <span className="font-medium">{property.rating}</span>
                  <span className="text-gray-600">({property.reviewCount} reviews)</span>
                </div>

                <div className="pt-2">
                  <span className="text-xl font-semibold">₫ {property.price.toLocaleString()}</span>
                  <span className="text-gray-600"> /night</span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
