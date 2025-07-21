"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Star, MapPin, Wifi, Car, Utensils, Tv, Wind, Coffee, Clock } from "lucide-react"
import { PropertyEditModal } from "@/components/host/property-edit-modal"
import type { HostProperty, PropertyEditSection } from "@/types/host"

interface PropertyDetailsPageProps {
  params: {
    id: string
  }
}

export default function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const [property, setProperty] = useState<HostProperty | null>(null)
  const [editingSection, setEditingSection] = useState<PropertyEditSection | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockProperty: HostProperty = {
      id: params.id,
      title: "Ponta Delgada",
      location: "Portugal",
      description:
        "Albatroz Club Ramalho is featured among the best hotels in Maldives and sits exclusively at the tip of the South Male atoll within the exotic collection of islands known as the Maldives. Its unique location offers access to pristine beaches, excellent scuba diving opportunities and a relaxed environment with easy access to the capital city of Male.",
      details: "3 guests • 1 bedroom • 1 bed • 1 bathroom",
      amenities: ["Wifi", "TV", "Air conditioning", "Pool", "Hair dryer", "Long-term stays allowed"],
      rating: 5.0,
      reviewCount: 7,
      images: [
        "/placeholder.svg?height=400&width=600",
        "/placeholder.svg?height=200&width=300",
        "/placeholder.svg?height=200&width=300",
        "/placeholder.svg?height=200&width=300",
        "/placeholder.svg?height=200&width=300",
      ],
      price: 250,
      bedrooms: 1,
      bathrooms: 1,
      guests: 3,
      hostId: "host1",
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    setTimeout(() => {
      setProperty(mockProperty)
      setLoading(false)
    }, 1000)
  }, [params.id])

  const handleEditSection = (section: PropertyEditSection) => {
    setEditingSection(section)
  }

  const handleSaveSection = (sectionId: string, newContent: any) => {
    if (!property) return

    const updatedProperty = { ...property }

    switch (sectionId) {
      case "title":
        updatedProperty.title = newContent
        break
      case "description":
        updatedProperty.description = newContent
        break
      case "bedrooms":
        updatedProperty.details = newContent
        break
      case "amenities":
        updatedProperty.amenities = Array.isArray(newContent)
          ? newContent
          : newContent.split("\n").filter((item: string) => item.trim())
        break
    }

    setProperty(updatedProperty)
    setEditingSection(null)
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

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-600">Property not found</p>
        </div>
      </div>
    )
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
                    <div className="flex items-center space-x-2">
                      <Star className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Experienced host</span>
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
                      content: "1 double bed",
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
                  <p className="text-sm text-gray-600">1 double bed</p>
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

          {/* Reviews */}
          <Card className="border border-gray-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span className="text-xl font-semibold">{property.rating}</span>
                <span className="text-xl font-semibold">•</span>
                <span className="text-xl font-semibold">{property.reviewCount} reviews</span>
              </div>

              {/* Review Categories */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cleanliness</span>
                    <span className="text-sm font-medium">5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gray-900 h-1 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Accuracy</span>
                    <span className="text-sm font-medium">5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gray-900 h-1 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Communication</span>
                    <span className="text-sm font-medium">5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gray-900 h-1 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Location</span>
                    <span className="text-sm font-medium">4.9</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gray-900 h-1 rounded-full" style={{ width: "98%" }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Check-in</span>
                    <span className="text-sm font-medium">5.0</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gray-900 h-1 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Value</span>
                    <span className="text-sm font-medium">4.7</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-gray-900 h-1 rounded-full" style={{ width: "94%" }}></div>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="space-y-6">
                {[
                  {
                    name: "Jose",
                    date: "December 2021",
                    comment: "Host was very attentive.",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                  {
                    name: "Luke",
                    date: "December 2021",
                    comment: "Nice place to stay!",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                  {
                    name: "Shayna",
                    date: "December 2021",
                    comment:
                      "Wonderful stay! The location is perfect to restaurants and bars. Really cozy studio apartment with a super comfortable bed. Great hosts, super helpful and responsive. Cool murphy bed!",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                  {
                    name: "Josh",
                    date: "November 2021",
                    comment: "Well designed and fun space, neighborhood has lots of energy and amenities.",
                    avatar: "/placeholder.svg?height=40&width=40",
                  },
                ].map((review, index) => (
                  <div key={index} className="flex space-x-4">
                    <img
                      src={review.avatar || "/placeholder.svg"}
                      alt={review.name}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-900">{review.name}</span>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="mt-6 bg-transparent">
                Show all {property.reviewCount} reviews
              </Button>
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

              {/* Map placeholder */}
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
      />
    </div>
  )
}
