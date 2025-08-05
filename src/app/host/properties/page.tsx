"use client"

import { useState, useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import Link from "next/link"
import { PropertyCreationModal } from "@/components/host/property-creation-modal"
import type { HostProperty } from "@/types/host"
import { AuctionSetupModal } from "@/components/host/auction-setup-modal"

interface PropertyResponseDTO {
  id: number
  host_id: string
  title: string
  description: string
  property_type: string
  category: string
  max_guests: number
  bedrooms: number
  bathrooms: number
  city: string
  state?: string
  country?: string
  base_price: number
  status: string
  created_at: string
  updated_at: string
  amenities: { id: string; name: string; category: string; created_at: string }[]
  images: { id: string; image_url: string; display_order: number; is_primary: boolean; created_at: string }[]
  host: { host_id: string; host_rating_average: number }
}

const apiUrl = "http://127.0.0.1:8000"
const propertiesPerPage = 12

export default function HostProperties() {
  const [properties, setProperties] = useState<HostProperty[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreationModal, setShowCreationModal] = useState(false)

  const hostId = "1" // TODO: Replace with dynamic hostId from useAuth
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const refreshKey = searchParams.get("refresh")

  const fetchProperties = async (pageNum: number) => {
    console.log(`Fetching properties for hostId=${hostId}, page=${pageNum}, offset=${(pageNum - 1) * propertiesPerPage}`)
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(
        `${apiUrl}/properties/host/${hostId}/properties?limit=${propertiesPerPage}&offset=${(pageNum - 1) * propertiesPerPage}`,
        { cache: "no-store" }
      )
      console.log("API Response Status:", response.status)
      if (!response.ok) {
        const errorData = await response.json()
        console.log("API Error Data:", errorData)
        const errorMessage = errorData.detail?.detail || errorData.detail || "Failed to fetch properties"
        throw new Error(errorMessage.includes("validation errors") ? "Unable to load properties due to server data issues" : errorMessage)
      }
      const data: PropertyResponseDTO[] = await response.json()
      console.log("API Response Data:", data)
      const newProperties: HostProperty[] = data.map((prop) => ({
        id: prop.id.toString(),
        title: prop.title,
        location: `${prop.city}${prop.state ? `, ${prop.state}` : ""}${prop.country ? `, ${prop.country}` : ""}`,
        description: prop.description || prop.category,
        details: `${prop.max_guests} guests • ${prop.category} • ${prop.bedrooms || 0} bedrooms • ${prop.bathrooms || 0} bathrooms`,
        amenities: prop.amenities?.map((a) => a.name) || [],
        rating: prop.host?.host_rating_average || 5.0,
        reviewCount: 0,
        images: prop.images?.map((img) => img.image_url) || ["/placeholder.svg?height=300&width=400"],
        price: prop.base_price,
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        guests: prop.max_guests || 1,
        beds: prop.bedrooms || 0,
        hostId: prop.host_id?.toString() || hostId,
        isAvailable: prop.status === "ACTIVE",
        createdAt: new Date(prop.created_at),
        updatedAt: new Date(prop.updated_at),
        type: prop.property_type,
        pricePerNight: prop.base_price,
        isActive: prop.status === "ACTIVE",
      }))

      setProperties((prev) => {
        const existingIds = new Set(prev.map((p) => p.id))
        const uniqueNewProperties = newProperties.filter((p: HostProperty) => !existingIds.has(p.id))
        console.log("New Properties:", uniqueNewProperties)
        return pageNum === 1 ? uniqueNewProperties : [...prev, ...uniqueNewProperties]
      })
      setHasMore(newProperties.length === propertiesPerPage)
    } catch (error: any) {
      console.error("Error fetching properties:", error)
      setError(error.message || "Unable to load properties. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    console.log(`useEffect triggered: pathname=${pathname}, refreshKey=${refreshKey}, properties.length=${properties.length}`)
    if (pathname === "/host/properties" && !loading) {
      setProperties([])
      setPage(1)
      fetchProperties(1)
    }
  }, [pathname, refreshKey])

  useEffect(() => {
    if (page > 1 && !loading) {
      fetchProperties(page)
    }
  }, [page])

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1)
    }
  }

  const handleModalClose = () => {
    console.log("Modal closed, refreshing properties")
    setShowCreationModal(false)
    setProperties([])
    setPage(1)
    fetchProperties(1)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Your properties</h1>
        <Button onClick={() => setShowCreationModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
          + Add a new property
        </Button>
      </div>

      {loading && page === 1 ? (
        <div className="animate-pulse">
          <div className="space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          {error}
          <Button
            onClick={() => {
              setPage(1)
              setProperties([])
              fetchProperties(1)
            }}
            className="mt-4 bg-cyan-500 hover:bg-cyan-600 text-white"
          >
            Retry
          </Button>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center text-gray-600">No properties found. Add a new property to get started!</div>
      ) : (
        <>
          <div className="space-y-6">
            {properties.map((property) => (
              <Card key={property.id} className="border border-gray-200 rounded-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-80 h-48 flex-shrink-0">
                      <img
                        src={property.images[0] || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
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
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {hasMore && (
            <Button
              onClick={handleLoadMore}
              className="mt-6 w-full bg-cyan-500 hover:bg-cyan-600 text-white"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          )}
        </>
      )}

      <PropertyCreationModal
        isOpen={showCreationModal}
        onClose={handleModalClose}
      />
    </div>
  )
}