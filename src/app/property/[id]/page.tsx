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

export default function PropertyPage() {
  const params = useParams()
  const propertyId = params.id as string
  const { property, loading, error, refetch } = usePropertyDetails(propertyId)
  const [isFavorite, setIsFavorite] = useState(false)

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

  return (
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

            {/* Location */}
            <PropertyLocation
              location={property.location}
              locationDescriptions={property.location_descriptions}
            />

            {/* Host Profile */}
            <HostProfile host={property.host} />

            {/* Reviews */}
            <PropertyReviews
              reviews={property.reviews}
              propertyId={property.id}
            />
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
                          <BookingPanel
                currentBid={property.active_auctions[0]?.current_highest_bid || property.base_price}
                lowestOffer={property.base_price}
                timeLeft={property.active_auctions[0] ? "2h 30m" : "No active auction"}
                propertyId={property.id}
                propertyTitle={property.title}
                basePrice={property.base_price}
                cleaningFee={property.cleaning_fee}
                serviceFee={property.service_fee}
                availabilityCalendar={property.availability_calendar}
                activeAuctions={property.active_auctions}
              />
          </div>
        </div>
      </div>
    </div>
  )
}