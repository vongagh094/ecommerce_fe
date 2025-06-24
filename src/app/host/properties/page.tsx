"use client"

import { useState } from "react"
import Image from "next/image"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AuctionSetupModal } from "@/components/host/auction-setup-modal"
import { PropertyCreationModal } from "@/components/host/property-creation-modal"

const properties = [
  {
    id: 1,
    title: "Bordeaux Getaway",
    location: "Entire home in Bordeaux",
    details: "4-6 guests • Entire Home • 5 beds • 3 bath",
    amenities: "Wifi • Kitchen • Free Parking",
    rating: 5.0,
    reviewCount: 318,
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: 2,
    title: "Bordeaux Getaway",
    location: "Entire home in Bordeaux",
    details: "4-6 guests • Entire Home • 5 beds • 3 bath",
    amenities: "Wifi • Kitchen • Free Parking",
    rating: 5.0,
    image: "/placeholder.svg?height=200&width=300",
  },
]

export default function HostProperties() {
  const [selectedProperty, setSelectedProperty] = useState<(typeof properties)[0] | null>(null)
  const [showAuctionModal, setShowAuctionModal] = useState(false)
  const [showPropertyModal, setShowPropertyModal] = useState(false)

  const handleSetupAuction = (property: (typeof properties)[0]) => {
    setSelectedProperty(property)
    setShowAuctionModal(true)
  }

  const handleAddProperty = () => {
    setShowPropertyModal(true)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Your properties</h1>
        <Button
          onClick={handleAddProperty}
          className="bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium"
        >
          + Add a new property
        </Button>
      </div>

      {/* Properties List */}
      <div className="space-y-8">
        {properties.map((property) => (
          <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start space-x-6">
              {/* Property Image */}
              <div className="flex-shrink-0">
                <Image
                  src={property.image || "/placeholder.svg"}
                  alt={property.title}
                  width={300}
                  height={200}
                  className="rounded-xl object-cover"
                />
              </div>

              {/* Property Details */}
              <div className="flex-1">
                <div className="mb-2">
                  <p className="text-sm text-gray-600 mb-1">{property.location}</p>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">{property.title}</h3>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-gray-700">{property.details}</p>
                  <p className="text-gray-700">{property.amenities}</p>
                </div>

                <div className="flex items-center space-x-1">
                  <span className="font-semibold text-gray-900">{property.rating}</span>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-gray-600">({property.reviewCount} reviews)</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                <Button
                  onClick={() => handleSetupAuction(property)}
                  className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg font-medium text-lg"
                >
                  Setup an auction now
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auction Setup Modal */}
      <AuctionSetupModal
        isOpen={showAuctionModal}
        onClose={() => setShowAuctionModal(false)}
        property={selectedProperty}
      />
      <PropertyCreationModal isOpen={showPropertyModal} onClose={() => setShowPropertyModal(false)} />
    </div>
  )
}
