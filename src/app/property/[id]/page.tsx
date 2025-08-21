"use client"

import { useState, useCallback } from "react"
import { useParams } from "next/navigation"
import { usePropertyDetails } from "@/hooks/use-property-details"
import { PropertyGallery } from "@/components/traveller/property-gallery"
import { PropertyHeader } from "@/components/traveller/property-header"
import { PropertyDetails as PropertyDetailsComponent } from "@/components/traveller/property-details"
import { EnhancedPropertyAmenities } from "@/components/traveller/enhanced-property-amenities"
import { PropertyLocation } from "@/components/traveller/property-location"
import { PropertyReviews } from "@/components/traveller/property-reviews"
import { HostProfile } from "@/components/traveller/host-profile"
import { BookingPanel } from "@/components/traveller/booking-panel"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import {CalenderBidingFeature} from "@/components/traveller/calender-biding-feature"
import {CalendarProvider} from "@/contexts/calender-context"
import SimpleAuctionSelector from "@/components/traveller/auction-infor-biding"
import {AuctionProvider} from "@/contexts/auction-calendar-context"
import { useAuth } from "@/contexts/auth-context"

export default function PropertyPage() {
  const params = useParams()
  const propertyId = params.id as string
  const { property, loading, error, refetch } = usePropertyDetails(propertyId)
  const [isFavorite, setIsFavorite] = useState(false)
  const { user } = useAuth()

  const handleFavoriteToggle = useCallback(() => {
    setIsFavorite(prev => !prev)
    // Here you would call your API to update the favorite status
    console.log(`Property ${propertyId} favorite status toggled to: ${!isFavorite}`)
  }, [propertyId, isFavorite])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => refetch()}
            className="bg-rose-500 text-white px-6 py-2 rounded-lg hover:bg-rose-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600">The property you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }
    const booking = "10000002-1000-1000-1000-100000000002"
  // @ts-ignore
    // @ts-ignore

  return (
    <AuctionProvider>
      <CalendarProvider>
        <div className="min-h-screen bg-white">
          {/* Property Header */}
          <PropertyHeader
            title={property.title}
            rating={property.rating.average}
            reviewCount={property.rating.count}
            location={`${property.location.city}, ${property.location.state}, ${property.location.country}`}
            isSuperhost={property.host.is_super_host}
          />

          {/* Property Gallery */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <PropertyGallery 
              images={property.images} 
              onFavoriteToggle={handleFavoriteToggle}
              isFavorite={isFavorite}
            />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Property Details */}
                <PropertyDetailsComponent
                  propertyType={property.property_type}
                  maxGuests={property.max_guests}
                  bedrooms={property.bedrooms}
                  bathrooms={property.bathrooms}
                  description={property.description}
                  highlights={property.highlights}

                />

                {/* Amenities */}
                <EnhancedPropertyAmenities amenities={property.amenities} />
                <div className="lg:col-span-2 space-y-12">
                      <CalenderBidingFeature property_id={Number(property.id)}/>
                    {/*<HostProfile />*/}
                </div>
                {/* Location */}
                <PropertyLocation
                  location={property.location}
                  locationDescriptions={property.location_descriptions}
                />


                {/* Reviews */}
                <PropertyReviews
                  reviews={{
                    average_rating: property.reviews.average_rating,
                    total_reviews: property.reviews.total_reviews,
                    rating_breakdown: {
                      cleanliness: property.reviews.rating_breakdown.cleanliness,
                      accuracy: property.reviews.rating_breakdown.accuracy,
                      location: property.reviews.rating_breakdown.location,
                      checking: property.reviews.rating_breakdown.checking,
                      communication: property.reviews.rating_breakdown.communication,
                      value: property.reviews.rating_breakdown.value,
                    },
                    recent_reviews: property.reviews.recent_reviews,
                  }}
                  propertyId={property.id}
                  reviewerId={Number(user?.id ?? 0)}
                  revieweeId={Number(property.host.id)}
                /> 
              </div>

                {/* Host Profile */}
                <div className="lg:col-span-1">
                  <div className="lg:col-span-1 space-y-6">
                        <SimpleAuctionSelector propertyId={Number(property.id)}/>
                        <BookingPanel user_id={Number(user?.id)}
                                  property_id={Number(property.id)}
                        />
                        <HostProfile host={property.host} />
                  </div>
                </div>
            </div>
          </div>
        </div>
      </CalendarProvider>
    </AuctionProvider>

  )
}