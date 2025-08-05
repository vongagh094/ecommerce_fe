"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Wifi, Car, Utensils, Tv, Wind, Coffee, Clock, ArrowLeft } from "lucide-react"
import { PropertyEditModal } from "@/components/host/property-edit-modal"
import type { HostProperty, PropertyEditSection } from "@/types/host"
import React from "react"
import { useRouter } from "next/navigation"

interface PropertyDetailsPageProps {
  params: Promise<{ id: string }>
}

const apiUrl = "http://127.0.0.1:8000"

export default function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const [property, setProperty] = useState<HostProperty | null>(null)
  const [editingSection, setEditingSection] = useState<PropertyEditSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Unwrap params using React.use
  const { id } = React.use(params)

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${apiUrl}/properties/${id}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Property not found")
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        // Map PropertyResponseDTO to HostProperty
        const mappedProperty: HostProperty = {
          id: data.id.toString(),
          title: data.title,
          location: `${data.city}${data.state ? `, ${data.state}` : ""}${data.country ? `, ${data.country}` : ""}`,
          description: data.description,
          details: `${data.max_guests} guests • ${data.bedrooms} bedrooms • ${data.bathrooms} bathrooms`,
          amenities: data.amenities?.map((amenity: any) => amenity.name) || [],
          rating: data.host?.host_rating_average || 0,
          reviewCount: 0, // No review endpoint provided
          images: data.images?.map((img: any) => img.image_url) || ["/placeholder.svg?height=300&width=400"],
          price: data.base_price,
          bedrooms: data.bedrooms || 0,
          bathrooms: data.bathrooms || 0,
          guests: data.max_guests || 1,
          hostId: data.host_id?.toString() || "1", // TODO: Replace with actual host_id from auth context
          isAvailable: data.status === "ACTIVE",
          createdAt: new Date(data.created_at),
          updatedAt: data.updated_at || new Date(data.updated_at),
        }

        setProperty(mappedProperty)
      } catch (err: any) {
        setError(err.message || "Failed to fetch property")
      } finally {
        setLoading(false)
      }
    }

    fetchProperty()
  }, [id])

  const handleEditSection = (section: PropertyEditSection) => {
    setEditingSection(section)
  }

  const handleSaveSection = async (sectionId: string, newContent: any) => {
    if (!property) return

    try {
      const updatePayload: any = {}
      if (sectionId === "title") updatePayload.title = newContent
      if (sectionId === "description") updatePayload.description = newContent
      if (sectionId === "bedrooms") {
        updatePayload.bedrooms = parseInt(newContent.split(" ")[0]) || 1 // Extract number from "X double bed"
      }
      if (sectionId === "amenities") {
        updatePayload.amenities = newContent.map((name: string) => ({
          amenity_id: name, // Assume backend can handle name as ID or adjust based on API
        }))
      }

      const response = await fetch(`${apiUrl}/properties/update/${property.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      })
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update property: ${errorText}`)
      }

      const updatedProperty = { ...property }
      switch (sectionId) {
        case "title":
          updatedProperty.title = newContent
          break
        case "description":
          updatedProperty.description = newContent
          break
        case "bedrooms":
          updatedProperty.bedrooms = parseInt(newContent.split(" ")[0]) || 1
          updatedProperty.details = `${property.guests} guests • ${updatedProperty.bedrooms} bedrooms • ${property.bathrooms} bathrooms`
          break
        case "amenities":
          updatedProperty.amenities = Array.isArray(newContent)
            ? newContent
            : newContent.split("\n").filter((item: string) => item.trim())
          break
      }

      setProperty(updatedProperty)
      setEditingSection(null)
    } catch (error: any) {
      console.error("Error updating property:", error)
      setError("Failed to save changes. Please try again.")
    }
  }

  const getAmenityIcon = (amenity: string) => {
    const iconMap: { [key: string]: any } = {
      Wifi: Wifi,
      TV: Tv,
      "Air conditioning": Wind,
      Pool: "🏊",
      "Hair dryer": "💨",
      "Long-term stays allowed": Clock,
      Breakfast: Coffee,
      "Free parking": Car,
      Kitchen: Utensils,
    }

    const IconComponent = iconMap[amenity]
    if (typeof IconComponent === "string") {
      return <span className="text-lg">{IconComponent}</span>
    }
    return IconComponent ? <IconComponent className="h-5 w-5" /> : <div className="w-5 h-5 bg-gray-300 rounded" />
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 h-96 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">{error || "Property not found"}</p>
        </div>
      </div>
    )
  }

  function handleDeleteProperty(id: string): void {
    fetch(`${apiUrl}/properties/delete/${id}`, {
      method: "DELETE",
      
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete property")
        }
      })
      .catch((error) => {
        console.error("Error deleting property:", error)
        alert("Failed to delete property. Please try again.")
      })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">{property.title}</h1>
          <p className="text-gray-600">{property.location}</p>
        </div>
        <Button
          onClick={() =>
            handleEditSection({
              id: "title",
              title: "Property Title",
              content: property.title,
              type: "text",
            })
          }
          className="bg-cyan-500 hover:bg-cyan-600 text-white"
        >
          Edit
        </Button>
      </div>
      {/* Actions nằm ở bên phải */}
      <div className="flex justify-end space-x-4 mb-8">
        <Button variant="destructive" onClick={() => handleDeleteProperty(property.id)}>
          Delete Property
        </Button>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <img
            src={property.images[0] || "/placeholder.svg"}
            alt={property.title}
            className="w-full h-96 object-cover rounded-2xl"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {property.images.slice(1, 5).map((image, index) => (
            <div key={index} className="relative">
              <img
                src={image || "/placeholder.svg"}
                alt={`${property.title} ${index + 2}`}
                className="w-full h-44 object-cover rounded-2xl"
              />
              {index === 3 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-2xl flex items-center justify-center">
                  <Button variant="outline" className="bg-white">
                    📷 Show all photos
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Property Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Host Info */}
          <Card className="border border-gray-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Dome hosted by you</h2>
                  <p className="text-gray-600">{property.details}</p>
                  <div className="flex items-center mt-4 space-x-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Dive right in</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() =>
                    handleEditSection({
                      id: "description",
                      title: "Property Description",
                      content: property.description,
                      type: "textarea",
                    })
                  }
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Edit
                </Button>
              </div>
              <p className="text-gray-700 mt-4 leading-relaxed">{property.description}</p>
            </CardContent>
          </Card>

          {/* Where you'll sleep */}
          <Card className="border border-gray-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Where you'll sleep</h2>
                <Button
                  onClick={() =>
                    handleEditSection({
                      id: "bedrooms",
                      title: "Bedroom Configuration",
                      content: `${property.bedrooms} double bed`,
                      type: "bedrooms",
                    })
                  }
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Edit
                </Button>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">🛏️</div>
                <div>
                  <p className="font-medium text-gray-900">Bedroom</p>
                  <p className="text-sm text-gray-600">{property.bedrooms} bedrooms</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What this place offers */}
          <Card className="border border-gray-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">What this place offers</h2>
                <Button
                  onClick={() =>
                    handleEditSection({
                      id: "amenities",
                      title: "Amenities",
                      content: property.amenities,
                      type: "amenities",
                    })
                  }
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {getAmenityIcon(amenity)}
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Where you'll be */}
          <Card className="border border-gray-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Where you'll be</h2>
                <Button
                  onClick={() =>
                    handleEditSection({
                      id: "location",
                      title: "Location Information",
                      content: property.location,
                      type: "text",
                    })
                  }
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  Edit
                </Button>
              </div>
              <div className="w-full h-64 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <div className="text-center">
                  <MapPin className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">Map will be displayed here</p>
                  <p className="text-sm text-gray-400">Exact location provided after booking</p>
                </div>
              </div>
              <p className="text-gray-700">{property.location}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Host Info */}
        <div className="space-y-6">
          <Card className="border border-gray-200 rounded-2xl sticky top-6">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-xl text-gray-600">👤</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">You are the host</h3>
                <p className="text-sm text-gray-600 mb-4">Manage your property settings and guest communications</p>
                <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">View Analytics</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <PropertyEditModal
        isOpen={!!editingSection}
        onClose={() => setEditingSection(null)}
        section={editingSection}
        onSave={handleSaveSection}
        propertyId={id}
      />
    </div>
  )
}