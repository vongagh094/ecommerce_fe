"use client"

import { Wifi, Car, Tv, Coffee, Waves, Wind, Utensils, Shirt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { Amenity } from "@/types"

interface PropertyAmenitiesProps {
  amenities: Amenity[]
}

// Icon mapping for common amenities
const getAmenityIcon = (name: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    wifi: <Wifi className="h-5 w-5" />,
    parking: <Car className="h-5 w-5" />,
    tv: <Tv className="h-5 w-5" />,
    coffee: <Coffee className="h-5 w-5" />,
    pool: <Waves className="h-5 w-5" />,
    "air conditioning": <Wind className="h-5 w-5" />,
    kitchen: <Utensils className="h-5 w-5" />,
    washer: <Shirt className="h-5 w-5" />,
  }
  
  const key = name.toLowerCase()
  return iconMap[key] || <div className="w-5 h-5 bg-gray-300 rounded" />
}

export function PropertyAmenities({ amenities }: PropertyAmenitiesProps) {
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  
  if (!amenities || amenities.length === 0) {
    return (
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">What this place offers</h3>
        <p className="text-gray-500">No amenities information available.</p>
      </div>
    )
  }

  // Group amenities by category
  const groupedAmenities = amenities.reduce((acc, amenity) => {
    if (!acc[amenity.category]) {
      acc[amenity.category] = []
    }
    acc[amenity.category].push(amenity)
    return acc
  }, {} as { [key: string]: Amenity[] })

  // Show first 10 amenities on main view
  const displayAmenities = amenities.slice(0, 10)
  const hasMoreAmenities = amenities.length > 10

  return (
    <>
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">What this place offers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayAmenities.map((amenity) => (
            <div key={amenity.id} className="flex items-center space-x-4">
              <div className="text-gray-600">
                {getAmenityIcon(amenity.name)}
              </div>
              <span className="text-gray-900">{amenity.name}</span>
            </div>
          ))}
        </div>

        {hasMoreAmenities && (
          <div className="mt-6">
            <Button
              variant="outline"
              onClick={() => setShowAllAmenities(true)}
              className="border-gray-900 text-gray-900 hover:bg-gray-50"
            >
              Show all {amenities.length} amenities
            </Button>
          </div>
        )}
      </div>

      {/* All Amenities Modal */}
      <Dialog open={showAllAmenities} onOpenChange={setShowAllAmenities}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>What this place offers</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {Object.entries(groupedAmenities).map(([category, categoryAmenities]) => (
              <div key={category}>
                <h4 className="font-medium text-gray-900 mb-3 capitalize">
                  {category.replace('_', ' ')}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {categoryAmenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center space-x-3">
                      <div className="text-gray-600">
                        {getAmenityIcon(amenity.name)}
                      </div>
                      <span className="text-gray-900">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}