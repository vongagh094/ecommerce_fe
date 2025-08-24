"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin } from "lucide-react"
import { PropertyDisplay } from "@/types"

interface PropertyGridDisplayProps {
  properties: PropertyDisplay[]
  userId: number
  onFavoriteToggle?: (propertyId: string, isFavorite: boolean) => void
  setIsMessageModalOpen?: (open: boolean) => void
}

export function PropertyGridDisplay({
  properties,
  userId,
  onFavoriteToggle,
  setIsMessageModalOpen
}: PropertyGridDisplayProps) {
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set())

  // Handle favorite toggle
  const handleToggleFavorite = useCallback((propertyId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    setFavoriteProperties(prev => {
      const newSet = new Set(prev)
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId)
      } else {
        newSet.add(propertyId)
      }
      return newSet
    })

    onFavoriteToggle?.(propertyId, !isFavorite)
  }, [onFavoriteToggle])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {properties.map((property) => {
        const isFavorite = favoriteProperties.has(property.id) || property.isFavorite

        return (
          <div key={property.id} className="group cursor-pointer block">
            <Link href={`/property/${property.id}`} className="block h-full">
              <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
                <Image
                  src={property.image || '/placeholder.svg'}
                  alt={property.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  loading="lazy"
                />

                {/* Favorite Button */}
                <button
                  onClick={(e) => handleToggleFavorite(property.id, e)}
                  className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform z-10"
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                >
                  <Heart
                    className={`h-5 w-5 ${isFavorite
                      ? 'fill-rose-500 text-rose-500'
                      : 'fill-black/50 text-white stroke-white'
                    }`}
                  />
                </button>

                {/* Guest Favorite Badge */}
                {property.isGuestFavorite && (
                  <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                    Guest favorite
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {property.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{property.rating}</span>
                </div>

                <div className="text-lg font-semibold text-gray-900">
                  {property.price}
                </div>

                <div className="text-sm text-gray-600">
                  {property.nights} night{property.nights !== 1 ? 's' : ''}
                </div>
              </div>
            </Link>
          </div>
        )
      })}
    </div>
  )
} 