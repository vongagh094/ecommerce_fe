"use client"

import { useState } from "react"
import Image from "next/image"
import { Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const properties = [
  {
    id: 1,
    title: "Ponta Delgada, Portugal",
    price: "₫ 2,000,000",
    rating: 4.33,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: true,
  },
  {
    id: 2,
    title: "Ponta Delgada, Portugal",
    price: "₫ 2,000,000",
    rating: 4.33,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: true,
  },
  {
    id: 3,
    title: "Apartment in Vietnam",
    price: "₫ 20,000,000",
    rating: 4.33,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: false,
  },
  {
    id: 4,
    title: "Flat in Warsaw, Poland",
    price: "₫ 20,000,000",
    rating: 4.33,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: false,
  },
  {
    id: 5,
    title: "Wadi Rum Village, Jordan",
    price: "₫ 29,916,000",
    rating: 4.33,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: true,
  },
  {
    id: 6,
    title: "Cottage in Sweden",
    price: "₫ 23,916,000",
    rating: 4.33,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: false,
  },
  {
    id: 7,
    title: "Wadi Rum Village, Jordan",
    price: "₫ 23,916,000",
    rating: 4.33,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: false,
  },
  {
    id: 8,
    title: "Koh Chang, Thailand",
    price: "₫ 23,916,000",
    rating: 4.8,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: false,
  },
  {
    id: 9,
    title: "Jaisalmer, India",
    price: "₫ 4,916,000",
    rating: 4.6,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: true,
    isGuestFavorite: false,
  },
  {
    id: 10,
    title: "Ortahisar, Turkey",
    price: "₫ 12,423,000",
    rating: 4.8,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: false,
    isGuestFavorite: false,
  },
  {
    id: 11,
    title: "Langkawi, Malaysia",
    price: "₫ 14,916,000",
    rating: 4.83,
    nights: 2,
    image: "/placeholder.svg?height=300&width=400",
    isFavorite: true,
    isGuestFavorite: false,
  },
]

export function PropertyGrid() {
  const [favorites, setFavorites] = useState<number[]>([9, 11])

  const toggleFavorite = (propertyId: number) => {
    setFavorites((prev) => (prev.includes(propertyId) ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]))
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map((property) => (
          <Link key={property.id} href={`/property/${property.id}`} className="group cursor-pointer block">
            <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
              <Image
                src={property.image || "/placeholder.svg"}
                alt={property.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation() // Add this line to prevent navigation
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
              {property.isGuestFavorite && (
                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                  Guest favourite
                </div>
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900 truncate">{property.title}</h3>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-current text-gray-900" />
                  <span className="text-sm text-gray-900">{property.rating}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">{property.price}</span> for {property.nights} night
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-12">
        <div className="mb-6">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Continue exploring amazing views</h2>
        </div>
        <Button variant="outline" className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900">
          Show more
        </Button>
      </div>
    </div>
  )
}
