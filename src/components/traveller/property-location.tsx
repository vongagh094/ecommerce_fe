'use client'

import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import AddressMap from "@/components/shared/map"
import { LocationDescription } from "@/types"

interface PropertyLocationProps {
  location: {
    address_line1: string
    city: string
    state: string
    country: string
    postal_code: string
    latitude: number
    longitude: number
  }
  locationDescriptions: LocationDescription[]
}

export function PropertyLocation({ location, locationDescriptions }: PropertyLocationProps) {
  const handleShowOnMap = () => {
    // Open in Google Maps
    const query = encodeURIComponent(`${location.address_line1}, ${location.city}, ${location.state}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank')
  }

  const handleGetDirections = () => {
    // Open directions in Google Maps
    if (location.latitude && location.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`, '_blank')
    } else {
      const query = encodeURIComponent(`${location.address_line1}, ${location.city}, ${location.state}`)
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}`, '_blank')
    }
  }
  
  const constructLocationString = () => {
    let locationString = []
    if (location.city) {
      locationString.push(location.city)
    }
    if (location.state) {
      locationString.push(location.state)
    }
    if (location.country) {
      locationString.push(location.country)
    }
    return locationString.join(', ')
  }

  const constructAddressString = () => {
    let addressString = []
    if (location.address_line1) {
      addressString.push(location.address_line1)
    }
    if (location.postal_code) {
      addressString.push(location.postal_code)
    }
    return addressString.join(', ')
  }

  // Map location to AddressData format for AddressMap
  const addressData = {
    address: location.address_line1 || '',
    city: location.city || '',
    state: location.state || '',
    country: location.country || '',
    postcode: location.postal_code || '',
    latitude: location.latitude || null,
    longitude: location.longitude || null,
  }

  return (
    <div className="border-t pt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Where you'll be</h3>
      
      {/* Location Info */}
      <div className="mb-6">
        <div className="flex items-start space-x-3">
          <MapPin className="h-5 w-5 text-gray-600 mt-1" />
          <div>
            <p className="text-gray-900 font-medium">
              {constructLocationString()}
            </p>
            <p className="text-gray-600 text-sm mt-1">
              {constructAddressString()}
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="mb-6">
        <AddressMap
          only_map={true}
          addressData={addressData}
          onSave={() => {}} // No-op function since only_map is true
        />
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <Button
          variant="outline"
          onClick={handleShowOnMap}
          className="flex items-center space-x-2"
        >
          <MapPin className="h-4 w-4" />
          <span>Show on map</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleGetDirections}
          className="flex items-center space-x-2"
        >
          <Navigation className="h-4 w-4" />
          <span>Get directions</span>
        </Button>
      </div>

      {/* Location Descriptions */}
      {locationDescriptions && locationDescriptions.length > 0 && (
        <div className="space-y-4">
          {locationDescriptions.map((desc) => (
            <div key={desc.id}>
              <h4 className="font-medium text-gray-900 mb-2">
                {desc.title || `About ${desc.description_type}`}
              </h4>
              <p className="text-gray-700 leading-relaxed">
                {desc.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Default description if none provided */}
      {(!locationDescriptions || locationDescriptions.length === 0) && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">About the area</h4>
          <p className="text-gray-700 leading-relaxed">
            This property is located in {location.city}, {location.state}. 
            The area offers convenient access to local attractions, dining, and transportation.
          </p>
        </div>
      )}
    </div>
  )
}