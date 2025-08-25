"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Star, Search, Plus, MapPin, Users, Bed, Bath, Eye, Gavel, Trash2, Loader2 } from "lucide-react"
import Link from "next/link"
import { PropertyCreationModal } from "@/components/host/property-creation-modal"
import { DeleteConfirmModal } from "@/components/host/delete-confirm-modal"
import { AuctionCreationModal } from "@/components/host/auction-creation-modal"
import { AuctionListModal } from "@/components/host/auction-list-modal"
import type { PropertyAPI } from "@/types/api"
import { useAuth } from "@/contexts/auth-context"

const apiUrl = process.env.NEXT_PUBLIC_API_URL

interface HostProperty {
  id: number
  title: string
  location: string
  description: string
  amenities: string[]
  rating: number
  reviewCount: number
  images: { image_url: string; is_primary: boolean }[]
  price: number
  bedrooms: number
  bathrooms: number
  guests: number
  hostId: number
  isAvailable: boolean
  status: "DRAFT" | "ACTIVE" | "INACTIVE"
  createdAt: Date
  updatedAt: Date
  propertyType: string
  category: string
}

export default function HostPropertiesPage() {
  const [properties, setProperties] = useState<HostProperty[]>([])
  const [filteredProperties, setFilteredProperties] = useState<HostProperty[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreationModal, setShowCreationModal] = useState(false)
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; property: HostProperty | null }>({
    isOpen: false,
    property: null,
  })
  const [showAuctionModal, setShowAuctionModal] = useState<{ isOpen: boolean; property: HostProperty | null }>({
    isOpen: false,
    property: null,
  })
  const [showAuctionListModal, setShowAuctionListModal] = useState<{ isOpen: boolean; property: HostProperty | null }>({
    isOpen: false,
    property: null,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "DRAFT" | "INACTIVE">("ALL")
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  const { user } = useAuth()
  const [hostId] = useState(user?.id || 1)
  const propertiesPerPage = 12

  const fetchProperties = async (page = 1, append = false) => {
    if (append) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const offset = (page - 1) * propertiesPerPage
      const response = await fetch(
        `${apiUrl}/properties-host/host/${hostId}/properties?limit=${propertiesPerPage}&offset=${offset}`,
      )
      if (!response.ok) {
        throw new Error(`Failed to fetch properties: ${response.statusText}`)
      }
      const data: PropertyAPI[] = await response.json()

      const mappedProperties: HostProperty[] = data.map((prop: PropertyAPI) => ({
        id: prop.id,
        title: prop.title,
        location: `${prop.city}${prop.state ? `, ${prop.state}` : ""}${prop.country ? `, ${prop.country}` : ""}`,
        description: prop.description || "",
        amenities: prop.amenities?.map((a: any) => a.name) || [],
        rating: prop.host?.host_rating_average || 0,
        reviewCount: 0,
        images: prop.images?.map((img: any) => ({
          image_url: img.image_url,
          is_primary: img.is_primary,
        })) || [{ image_url: "/placeholder.svg?height=300&width=400", is_primary: false }],
        price: prop.base_price,
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        guests: prop.max_guests || 1,
        hostId: prop.host_id || Number(hostId),
        isAvailable: prop.status === "ACTIVE",
        status: prop.status,
        createdAt: new Date(prop.created_at),
        updatedAt: new Date(prop.updated_at || prop.created_at),
        propertyType: prop.property_type,
        category: prop.category,
      }))

      if (append) {
        setProperties((prev) => [...prev, ...mappedProperties])
      } else {
        setProperties(mappedProperties)
      }

      setHasMore(data.length === propertiesPerPage)

      if (!append) {
        setTotalCount(mappedProperties.length + (data.length === propertiesPerPage ? propertiesPerPage : 0))
      }
    } catch (err: any) {
      setError(err.message || "Failed to load properties")
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMore = () => {
    const nextPage = currentPage + 1
    setCurrentPage(nextPage)
    fetchProperties(nextPage, true)
  }

  useEffect(() => {
    fetchProperties(1, false)
  }, [])

  useEffect(() => {
    let filtered = properties

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (property) =>
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          property.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filter by status
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((property) => property.status === statusFilter)
    }

    setFilteredProperties(filtered)
  }, [properties, searchTerm, statusFilter])

  const handleDeleteProperty = async (propertyId: number) => {
    try {
      const response = await fetch(`${apiUrl}/properties-host/delete/${propertyId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        throw new Error(`Failed to delete property: ${response.statusText}`)
      }
      setProperties((prev) => prev.filter((p) => p.id !== propertyId))
      setDeleteModal({ isOpen: false, property: null })
    } catch (err: any) {
      setError(err.message || "Failed to delete property")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: "bg-green-100 text-green-800",
      DRAFT: "bg-gray-100 text-gray-800",
      INACTIVE: "bg-red-100 text-red-800",
    }
    return variants[status as keyof typeof variants] || variants.DRAFT
  }

  if (loading && properties.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">Your Properties</h1>
          <p className="text-gray-600 mt-1">
            Manage your property listings and bookings
            {properties.length > 0 && <span className="ml-2 text-sm">({properties.length} properties loaded)</span>}
          </p>
        </div>
        <Button onClick={() => setShowCreationModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search properties by title, location, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
          <Button
            onClick={() => fetchProperties(1, false)}
            className="mt-2 bg-red-600 hover:bg-red-700 text-white"
            size="sm"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== "ALL"
              ? "Try adjusting your search or filters"
              : "Get started by adding your first property"}
          </p>
          {!searchTerm && statusFilter === "ALL" && (
            <Button onClick={() => setShowCreationModal(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Property
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={
                      property.images.find((img) => img.is_primary)?.image_url ||
                      property.images[0]?.image_url ||
                      "/placeholder.svg?height=200&width=300" ||
                      "/placeholder.svg"
                    }
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <Badge className={`absolute top-3 right-3 ${getStatusBadge(property.status)}`}>
                    {property.status}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                      {property.rating > 0 ? property.rating.toFixed(1) : "New"}
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2 line-clamp-1">{property.location}</p>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{property.category}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {property.guests}
                    </div>
                    <div className="flex items-center">
                      <Bed className="h-3 w-3 mr-1" />
                      {property.bedrooms}
                    </div>
                    <div className="flex items-center">
                      <Bath className="h-3 w-3 mr-1" />
                      {property.bathrooms}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-lg font-semibold text-gray-900">${property.price}</span>
                      <span className="text-sm text-gray-500"> / night</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {/* Primary Actions Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <Link href={`/host/properties/${property.id}`} className="block">
                        <Button variant="outline" size="sm" className="w-full bg-transparent">
                          <Eye className="h-3 w-3 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAuctionModal({ isOpen: true, property })}
                        className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Create Auction
                      </Button>
                    </div>

                    {/* Secondary Actions Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAuctionListModal({ isOpen: true, property })}
                        className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                      >
                        <Gavel className="h-3 w-3 mr-2" />
                        View Auctions
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteModal({ isOpen: true, property })}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {hasMore && !searchTerm && statusFilter === "ALL" && (
            <div className="flex justify-center">
              <Button
                onClick={loadMore}
                disabled={loadingMore}
                className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading more properties...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Load More Properties
                  </>
                )}
              </Button>
            </div>
          )}

          {!hasMore && properties.length > propertiesPerPage && !searchTerm && statusFilter === "ALL" && (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">You've reached the end of your properties list</p>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <PropertyCreationModal
        isOpen={showCreationModal}
        onPropertyCreated={(newPropertyId: number) => {
          setShowCreationModal(false)
          fetchProperties(1, false)
        }}
        onClose={() => {
          setShowCreationModal(false)
          fetchProperties(1, false)
        }}
      />

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, property: null })}
        onConfirm={() => deleteModal.property && handleDeleteProperty(deleteModal.property.id)}
        propertyTitle={deleteModal.property?.title || ""}
      />

      <AuctionCreationModal
        isOpen={showAuctionModal.isOpen}
        onClose={() => setShowAuctionModal({ isOpen: false, property: null })}
        property={showAuctionModal.property}
      />

      <AuctionListModal
        isOpen={showAuctionListModal.isOpen}
        onClose={() => setShowAuctionListModal({ isOpen: false, property: null })}
        propertyId={showAuctionListModal.property?.id ?? 0}
      />
    </div>
  )
}