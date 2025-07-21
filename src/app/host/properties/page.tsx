"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import { PropertyCreationModal } from "@/components/host/property-creation-modal"
import { AuctionSetupModal } from "@/components/host/auction-setup-modal"
import type { HostProperty } from "@/types/host"

export default function HostProperties() {
  const [properties, setProperties] = useState<HostProperty[]>([])
  const [showCreationModal, setShowCreationModal] = useState(false)
  const [showAuctionModal, setShowAuctionModal] = useState(false)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockProperties: HostProperty[] = [
      {
        id: "1",
        title: "Bordeaux Getaway",
        location: "Bordeaux",
        description: "Entire home in Bordeaux",
        details: "4-6 guests • Entire Home • 5 beds • 3 bath\nWifi • Kitchen • Free Parking",
        amenities: ["Wifi", "Kitchen", "Free Parking"],
        rating: 5.0,
        reviewCount: 318,
        images: ["/placeholder.svg?height=300&width=400"],
        price: 150,
        bedrooms: 5,
        bathrooms: 3,
        guests: 6,
        hostId: "host1",
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Bordeaux Getaway",
        location: "Bordeaux",
        description: "Entire home in Bordeaux",
        details: "4-6 guests • Entire Home • 5 beds • 3 bath\nWifi • Kitchen • Free Parking",
        amenities: ["Wifi", "Kitchen", "Free Parking"],
        rating: 5.0,
        reviewCount: 318,
        images: ["/placeholder.svg?height=300&width=400"],
        price: 150,
        bedrooms: 5,
        bathrooms: 3,
        guests: 6,
        hostId: "host1",
        isAvailable: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    setTimeout(() => {
      setProperties(mockProperties)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSetupAuction = (propertyId: string) => {
    setSelectedPropertyId(propertyId)
    setShowAuctionModal(true)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Your properties</h1>
        <Button onClick={() => setShowCreationModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
          + Add a new property
        </Button>
      </div>

      <div className="space-y-6">
        {properties.map((property) => (
          <Card key={property.id} className="border border-gray-200 rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="flex">
                {/* Property Image */}
                <div className="w-80 h-48 flex-shrink-0">
                  <img
                    src={property.images[0] || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Property Details */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{property.description}</p>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{property.title}</h3>
                      <p className="text-gray-600 mb-4">{property.details}</p>

                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{property.rating}</span>
                        <span className="text-gray-600">({property.reviewCount} reviews)</span>
                      </div>
                    </div>

                    <Link href={`/host/properties/${property.id}`}>
                      <Button variant="ghost" className="text-cyan-600 hover:text-cyan-700">
                        View details
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Action Button */}
                <div className="p-6 flex items-center">
                  <Button
                    onClick={() => handleSetupAuction(property.id)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3"
                  >
                    Setup an auction now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modals */}
      <PropertyCreationModal isOpen={showCreationModal} onClose={() => setShowCreationModal(false)} />

      <AuctionSetupModal
        isOpen={showAuctionModal}
        onClose={() => setShowAuctionModal(false)}
        propertyId={selectedPropertyId}
      />
    </div>
  )
}
