"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Star, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PropertyCard } from "@/types"
import { formatPrice } from "@/lib/utils"

interface EnhancedPropertyGridProps {
  properties: PropertyCard[]
  loading?: boolean
  hasMore?: boolean
  canShowMore?: boolean
  onLoadMore?: () => void
  onShowMore?: () => void
  onToggleFavorite?: (propertyId: string) => void
}

export function EnhancedPropertyGrid({ 
  properties, 
  loading = false, 
  hasMore = false,
  canShowMore = false,
  onLoadMore,
  onShowMore,
  onToggleFavorite 
}: EnhancedPropertyGridProps) {
  const [favoriteProperties, setFavoriteProperties] = useState<Set<string>>(new Set())

  const handleToggleFavorite = (propertyId: string, e: React.MouseEvent) => {
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
    
    if (onToggleFavorite) {
      onToggleFavorite(propertyId)
    }
  }

  const renderPropertyCard = (property: PropertyCard) => {
    const primaryImage = property.images.find(img => img.is_primary) || property.images[0]
    const isFavorite = favoriteProperties.has(property.id) || property.is_guest_favorite
    
    return (
      <Link 
        key={property.id} 
        href={`/property/${property.id}`} 
        className="group cursor-pointer block"
      >
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
          <Image
            src={primaryImage?.image_url || '/placeholder.svg'}
            alt={primaryImage?.alt_text || property.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
          
          {/* Favorite Button */}
          <button
            onClick={(e) => handleToggleFavorite(property.id, e)}
            className="absolute top-3 right-3 p-2 hover:scale-110 transition-transform"
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
              {typeof property.rating?.average === 'number' ? (
                <span className="text-sm text-gray-900">
                  {property.rating.average.toFixed(1)}
                </span>
              ) : (
                <span className="text-sm text-gray-500">N/A</span>
              )}
              {property.rating?.count !== undefined && (
                <span className="text-sm text-gray-500">
                  ({property.rating.count})
                </span>
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
    )
  }

  if (loading && properties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
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
      </div>
    )
  }

  if (properties.length === 0 && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="max-w-md mx-auto">
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No properties found
          </h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your search criteria or browse different categories.
          </p>
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="bg-rose-500 text-white hover:bg-rose-600 border-rose-500"
          >
            Browse all properties
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {properties.map(renderPropertyCard)}
      </div>

      {/* Show More / Load More Buttons */}
      {(canShowMore || hasMore) && (
        <div className="text-center mt-12">
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Continue exploring amazing properties
            </h3>
            <p className="text-gray-600">
              Discover more unique places to stay
            </p>
          </div>
          
          {/* Show More Button (for already loaded items) */}
          {canShowMore && onShowMore && (
            <Button 
              variant="outline" 
              className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500 mr-4"
              onClick={onShowMore}
              disabled={loading}
            >
              Show more
            </Button>
          )}
          
          {/* Load More Button (for fetching new items) */}
          {hasMore && onLoadMore && (
            <Button 
              variant="outline" 
              className="bg-gray-900 text-white hover:bg-gray-800 border-gray-900"
              onClick={onLoadMore}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Load more'}
            </Button>
          )}
        </div>
      )}

      {/* Loading indicator for load more */}
      {loading && properties.length > 0 && (
        <div className="text-center mt-8">
          <div className="inline-flex items-center px-4 py-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
            Loading more properties...
          </div>
        </div>
      )}
    </div>
  )
}