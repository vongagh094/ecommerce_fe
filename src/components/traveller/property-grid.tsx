"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin } from "lucide-react"
import { PropertyCard } from "@/types"
import { formatPrice } from "@/lib/utils"

interface PropertyGridProps {
  properties: PropertyCard[]
  loading: boolean
  onToggleFavorite?: (propertyId: string) => void
  className?: string
}

export function PropertyGrid({
  properties,
  loading,
  onToggleFavorite,
  className = ""
}: PropertyGridProps) {
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
    
    onToggleFavorite?.(propertyId)
  }, [onToggleFavorite])

  // Render property card
  const renderPropertyCard = useCallback((property: PropertyCard) => {
    const primaryImage = property.images.find(img => img.is_primary) || property.images[0]
    const isFavorite = favoriteProperties.has(property.id) || property.is_guest_favorite
    
    return (
      <div key={property.id} className="group cursor-pointer block">
        <Link href={`/property/${property.id}`} className="block h-full">
          <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
            <Image
              src={primaryImage?.image_url || '/placeholder.svg'}
              alt={primaryImage?.alt_text || property.title}
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
                className={`h-5 w-5 ${
                  isFavorite 
                    ? 'fill-rose-500 text-rose-500' 
                    : 'fill-black/50 text-white stroke-white'
                }`}
              />
            </button>

            {/* Guest Favorite Badge */}
            {property.is_guest_favorite && (
              <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                Guest favorite
              </div>
            )}

            {/* Super Host Badge */}
            {property.host.is_super_host && (
              <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                Superhost
              </div>
            )}
          </div>

          <div className="space-y-1">
            {/* Location and Rating */}
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                <span className="truncate">
                  {property.location.city}, {property.location.state}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 fill-current text-gray-900" />
                {typeof property.rating?.average === 'string' ? (
                  <span className="text-sm text-gray-900">
                    {property.rating.average.substring(0, 4)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">N/A</span>
                )}
              </div>
            </div>

            {/* Property Title */}
            <h3 className="font-medium text-gray-900 truncate" title={property.title}>
              {property.title}
            </h3>

            {/* Property Type and Guests */}
            <p className="text-sm text-gray-600">
              {property.property_type} • {property.max_guests} guests
            </p>

            {/* Price */}
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">
                {formatPrice(property.base_price)}
              </span>
              {' '}per night
            </p>
          </div>
        </Link>
      </div>
    )
  }, [favoriteProperties, handleToggleFavorite])

  // Loading skeleton
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-square bg-gray-200 rounded-xl mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {properties.map(renderPropertyCard)}
    </div>
  )
}