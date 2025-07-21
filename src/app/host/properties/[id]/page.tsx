"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PropertyEditModal } from "@/components/host/property-edit-modal"
import { Star, MapPin, Bed, Wifi, Utensils, Waves } from "lucide-react"

interface PropertyEditSection {
  id: string
  title: string
  type: "text" | "textarea" | "amenities" | "bedrooms"
  content: any
}

// Mock property data
const mockProperty = {
  id: "1",
  title: "Ponta Delgada",
  location: "Portugal",
  type: "Dome",
  guests: 4,
  bedrooms: 1,
  bathrooms: 1,
  amenities: ["Wifi", "TV", "Hair dryer", "Long-term stays allowed", "Pool", "Air conditioning", "Breakfast"],
  images: [
    "/placeholder.svg?height=400&width=600&text=Main+Property+Image",
    "/placeholder.svg?height=300&width=400&text=Property+Image+2",
    "/placeholder.svg?height=300&width=400&text=Property+Image+3",
    "/placeholder.svg?height=300&width=400&text=Property+Image+4",
    "/placeholder.svg?height=300&width=400&text=Property+Image+5",
  ],
  rating: 5.0,
  reviews: 7,
  description:
    "Albatroz Club Ramalha is featured among the best hotels in Maldives and sits exclusively at the tip of the South Male atoll within the exotic collection of islands known as the Maldives. Its unique location offers access to pristine beaches, excellent scuba diving opportunities and a relaxed environment with easy access to the capital city of Male.",
  bedConfiguration: "1 double bed",
  pricePerNight: 150,
  isActive: true,
  reviewsData: [
    {
      id: 1,
      author: "Jose",
      date: "December 2021",
      rating: 5,
      comment: "Host was very attentive.",
      categories: {
        cleanliness: 5.0,
        communication: 5.0,
        checkin: 5.0,
      },
    },
    {
      id: 2,
      author: "Luke",
      date: "November 2021",
      rating: 5,
      comment: "Nice place to stay!",
      categories: {
        accuracy: 5.0,
        location: 4.8,
        value: 4.7,
      },
    },
  ],
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const [editingSection, setEditingSection] = useState<PropertyEditSection | null>(null)
  const [property, setProperty] = useState(mockProperty)

  const handleEdit = (section: PropertyEditSection) => {
    setEditingSection(section)
  }

  const handleSave = (sectionId: string, newContent: any) => {
    // Update property data
    setProperty((prev) => ({
      ...prev,
      [sectionId]: newContent,
    }))
    setEditingSection(null)
  }

  const amenityIcons: { [key: string]: any } = {
    Wifi: Wifi,
    Pool: Waves,
    "Air conditioning": "❄️",
    Breakfast: Utensils,
    TV: "📺",
    "Hair dryer": "💨",
    "Long-term stays allowed": "📅",
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <p className="text-gray-600 mt-1">{property.location}</p>
          </div>
          <Button
            onClick={() =>
              handleEdit({
                id: "title",
                title: "Property Title & Location",
                type: "text",
                content: `${property.title}, ${property.location}`,
              })
            }
            className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 text-sm"
          >
            Edit
          </Button>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-4 gap-2 mb-8 h-96">
          <div className="col-span-2 row-span-2">
            <img
              src={property.images[0] || "/placeholder.svg"}
              alt="Main property"
              className="w-full h-full object-cover rounded-l-lg"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <img
              src={property.images[1] || "/placeholder.svg"}
              alt="Property view"
              className="w-full h-full object-cover"
            />
            <img
              src={property.images[2] || "/placeholder.svg"}
              alt="Property view"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <img
              src={property.images[3] || "/placeholder.svg"}
              alt="Property view"
              className="w-full h-full object-cover rounded-tr-lg"
            />
            <div className="relative">
              <img
                src={property.images[4] || "/placeholder.svg"}
                alt="Property view"
                className="w-full h-full object-cover rounded-br-lg"
              />
              <Button variant="outline" className="absolute bottom-4 right-4 bg-white hover:bg-gray-50">
                📷 Show all photos
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="col-span-2 space-y-8">
            {/* Property Info */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{property.type} hosted by you</h2>
                <p className="text-gray-600">
                  {property.guests} guests · {property.bedrooms} bedroom · {property.bedrooms} bed ·{" "}
                  {property.bathrooms} bathroom
                </p>
              </div>
              <Button
                onClick={() =>
                  handleEdit({
                    id: "type",
                    title: "Property Type & Capacity",
                    type: "text",
                    content: `${property.type}, ${property.guests} guests, ${property.bedrooms} bedroom, ${property.bathrooms} bathroom`,
                  })
                }
                className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 text-sm"
              >
                Edit
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-4 py-6 border-t border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <MapPin className="w-6 h-6 text-gray-600" />
                <div>
                  <h3 className="font-medium">Dive right in</h3>
                  <p className="text-gray-600 text-sm">This is one of the few places in the area with a pool</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Star className="w-6 h-6 text-gray-600" />
                <div>
                  <h3 className="font-medium">Experienced host</h3>
                  <p className="text-gray-600 text-sm">Dimitry has 270 reviews for other places.</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">About this place</h3>
                <Button
                  onClick={() =>
                    handleEdit({
                      id: "description",
                      title: "Property Description",
                      type: "textarea",
                      content: property.description,
                    })
                  }
                  className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 text-sm"
                >
                  Edit
                </Button>
              </div>
              <p className="text-gray-700 leading-relaxed">{property.description}</p>
            </div>

            {/* Where you'll sleep */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Where you'll sleep</h3>
                <Button
                  onClick={() =>
                    handleEdit({
                      id: "bedConfiguration",
                      title: "Bedroom Configuration",
                      type: "bedrooms",
                      content: property.bedConfiguration,
                    })
                  }
                  className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 text-sm"
                >
                  Edit
                </Button>
              </div>
              <Card className="w-48">
                <CardContent className="p-4 text-center">
                  <Bed className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                  <h4 className="font-medium mb-1">Bedroom</h4>
                  <p className="text-sm text-gray-600">{property.bedConfiguration}</p>
                </CardContent>
              </Card>
            </div>

            {/* What this place offers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">What this place offers</h3>
                <Button
                  onClick={() =>
                    handleEdit({
                      id: "amenities",
                      title: "Amenities",
                      type: "amenities",
                      content: property.amenities,
                    })
                  }
                  className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 text-sm"
                >
                  Edit
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {property.amenities.map((amenity, index) => {
                  const IconComponent = amenityIcons[amenity]
                  return (
                    <div key={index} className="flex items-center space-x-3">
                      {typeof IconComponent === "string" ? (
                        <span className="text-xl">{IconComponent}</span>
                      ) : IconComponent ? (
                        <IconComponent className="w-6 h-6 text-gray-600" />
                      ) : (
                        <div className="w-6 h-6 bg-gray-200 rounded" />
                      )}
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <Star className="w-6 h-6 text-yellow-400 fill-current" />
                <span className="text-xl font-semibold">{property.rating}</span>
                <span className="text-xl font-semibold">·</span>
                <span className="text-xl font-semibold">{property.reviews} reviews</span>
              </div>

              {/* Review Categories */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cleanliness</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1 bg-gray-200 rounded">
                        <div className="w-full h-1 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Communication</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1 bg-gray-200 rounded">
                        <div className="w-full h-1 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Check-in</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1 bg-gray-200 rounded">
                        <div className="w-full h-1 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">5.0</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Accuracy</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1 bg-gray-200 rounded">
                        <div className="w-full h-1 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">5.0</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Location</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1 bg-gray-200 rounded">
                        <div className="w-20 h-1 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">4.8</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Value</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-1 bg-gray-200 rounded">
                        <div className="w-16 h-1 bg-blue-500 rounded"></div>
                      </div>
                      <span className="text-sm font-medium">4.7</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Individual Reviews */}
              <div className="grid grid-cols-2 gap-8 mb-6">
                {property.reviewsData.map((review) => (
                  <div key={review.id} className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{review.author}</h4>
                        <p className="text-sm text-gray-500">{review.date}</p>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="border-gray-900 text-gray-900 bg-transparent">
                Show all {property.reviews} reviews
              </Button>
            </div>

            {/* Location */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Where you'll be</h3>
                <Button
                  onClick={() =>
                    handleEdit({
                      id: "location",
                      title: "Location",
                      type: "text",
                      content: property.location,
                    })
                  }
                  className="bg-cyan-400 hover:bg-cyan-500 text-white px-4 py-2 text-sm"
                >
                  Edit
                </Button>
              </div>
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Map placeholder - {property.location}</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Empty for host view */}
          <div className="col-span-1">{/* This space can be used for host-specific tools or analytics */}</div>
        </div>

        {/* Edit Modal */}
        <PropertyEditModal
          isOpen={!!editingSection}
          onClose={() => setEditingSection(null)}
          section={editingSection}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
