"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyCreationModal } from "@/components/host/property-creation-modal"
import { AuctionSetupModal } from "@/components/host/auction-setup-modal"

// Mock data for properties
const mockProperties = [
  {
    id: "1",
    title: "Bordeaux Getaway",
    location: "Entire home in Bordeaux",
    type: "Entire Home",
    guests: 6,
    bedrooms: 5,
    bathrooms: 3,
    amenities: ["Wifi", "Kitchen", "Free Parking"],
    images: ["/placeholder.svg?height=300&width=400&text=Property+Image"],
    rating: 5.0,
    reviews: 318,
    description: "Beautiful home in Bordeaux",
    pricePerNight: 150,
    isActive: true,
  },
  {
    id: "2",
    title: "Bordeaux Getaway",
    location: "Entire home in Bordeaux",
    type: "Entire Home",
    guests: 6,
    bedrooms: 5,
    bathrooms: 3,
    amenities: ["Wifi", "Kitchen", "Free Parking"],
    images: ["/placeholder.svg?height=300&width=400&text=Property+Image"],
    rating: 5.0,
    reviews: 318,
    description: "Beautiful home in Bordeaux",
    pricePerNight: 150,
    isActive: true,
  },
]

export default function PropertiesPage() {
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [showAuctionModal, setShowAuctionModal] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  const handleSetupAuction = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setShowAuctionModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Your properties</h1>
          <Button
            onClick={() => setShowPropertyModal(true)}
            className="bg-cyan-400 hover:bg-cyan-500 text-white px-6 py-3 rounded-lg font-medium"
          >
            + Add a new property
          </Button>
        </div>

        {/* Properties List */}
        <div className="space-y-6">
          {mockProperties.map((property) => (
            <Card key={property.id} className="bg-white shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  {/* Property Image */}
                  <div className="flex-shrink-0">
                    <img
                      src={property.images[0] || "/placeholder.svg"}
                      alt={property.title}
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                  </div>

                  {/* Property Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">{property.location}</p>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                        <p className="text-gray-600 mb-3">
                          {property.guests} guests · {property.type} · {property.bedrooms} beds · {property.bathrooms}{" "}
                          bath
                        </p>
                        <p className="text-gray-600 mb-4">{property.amenities.join(" · ")}</p>
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="ml-1 font-medium">{property.rating}</span>
                          <span className="ml-1 text-gray-500">({property.reviews} reviews)</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col space-y-3 ml-6">
                        <Link href={`/host/properties/${property.id}`}>
                          <Button
                            variant="outline"
                            className="text-cyan-500 border-cyan-500 hover:bg-cyan-50 px-6 bg-transparent"
                          >
                            View details
                          </Button>
                        </Link>
                        <Button
                          onClick={() => handleSetupAuction(property.id)}
                          className="bg-cyan-400 hover:bg-cyan-500 text-white px-6"
                        >
                          Setup an auction now
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modals */}
        <PropertyCreationModal isOpen={showPropertyModal} onClose={() => setShowPropertyModal(false)} />

        <AuctionSetupModal
          isOpen={showAuctionModal}
          onClose={() => setShowAuctionModal(false)}
          propertyId={selectedPropertyId}
        />
      </div>
    </div>
  )
}
