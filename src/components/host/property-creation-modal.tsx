"use client"

import type React from "react"

import { useState, useRef } from "react"
import { X, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface PropertyCreationModalProps {
  isOpen: boolean
  onClose: () => void
}

const accommodationTypes = [
  { id: "amazing-pools", label: "Amazing pools", icon: "🏊" },
  { id: "farms", label: "Farms", icon: "🚜" },
  { id: "lakefront", label: "Lakefront", icon: "🏞️" },
  { id: "rooms", label: "Rooms", icon: "🏠" },
  { id: "cabins", label: "Cabins", icon: "🏘️" },
  { id: "treehouses", label: "Treehouses", icon: "🌳" },
  { id: "mansions", label: "Mansions", icon: "🏰" },
  { id: "domes", label: "Domes", icon: "⛺" },
  { id: "castles", label: "Castles", icon: "🏰" },
  { id: "amazing-views", label: "Amazing views", icon: "🏔️" },
  { id: "caves", label: "Caves", icon: "🕳️" },
  { id: "countryside", label: "Countryside", icon: "🌾" },
  { id: "luxe", label: "Luxe", icon: "💎" },
  { id: "historical-homes", label: "Historical homes", icon: "🏛️" },
  { id: "national-parks", label: "National parks", icon: "🏞️" },
  { id: "farms-2", label: "Farms", icon: "🚜" },
  { id: "amazing-pools-2", label: "Amazing pools", icon: "🏊" },
  { id: "beach", label: "Beach", icon: "🏖️" },
]

const amenities = [
  { id: "wifi", label: "Wifi", icon: "📶" },
  { id: "air-conditioner", label: "Air conditioner", icon: "❄️" },
  { id: "free-parking", label: "Free parking on premises", icon: "🅿️" },
  { id: "self-checkin", label: "Self check-in", icon: "🔑" },
  { id: "washing-machine", label: "Washing machine", icon: "🧺" },
  { id: "dedicated-workspace", label: "Dedicated workspace", icon: "💻" },
  { id: "elevator", label: "Elevator", icon: "🛗" },
  { id: "toiletries", label: "Toiletries", icon: "🧴" },
  { id: "hair-dryer", label: "Hair dryer", icon: "💨" },
  { id: "microwave", label: "Microwave", icon: "📱" },
  { id: "bathtub", label: "Bathtub", icon: "🛁" },
  { id: "iron", label: "Iron", icon: "👔" },
  { id: "coffee-machine", label: "Coffee machine", icon: "☕" },
  { id: "towels", label: "Towels", icon: "🏖️" },
  { id: "oven", label: "Oven", icon: "🔥" },
]

export function PropertyCreationModal({ isOpen, onClose }: PropertyCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [propertyData, setPropertyData] = useState({
    // Step 1: Contact
    idImage: null as File | null,
    email: "",
    phone: "",

    // Step 2: Accommodation type
    accommodationType: "",

    // Step 3: Address
    address: "",

    // Step 4: Details
    guests: 1,
    rooms: 1,
    beds: 1,
    restrooms: 1,

    // Step 5: Images
    images: [] as File[],

    // Step 6: Services
    selectedAmenities: [] as string[],

    // Step 7: Name and description
    name: "",
    description: "",
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const idInputRef = useRef<HTMLInputElement>(null)

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = () => {
    console.log("Creating property:", propertyData)
    // Handle property creation logic here
    onClose()
    setCurrentStep(1) // Reset for next time
  }

  const handleInputChange = (field: string, value: any) => {
    setPropertyData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountChange = (field: string, increment: boolean) => {
    setPropertyData((prev) => ({
      ...prev,
      [field]: increment ? prev[field as keyof typeof prev] + 1 : Math.max(1, prev[field as keyof typeof prev] - 1),
    }))
  }

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPropertyData((prev) => ({ ...prev, idImage: file }))
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setPropertyData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
  }

  const toggleAmenity = (amenityId: string) => {
    setPropertyData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter((id) => id !== amenityId)
        : [...prev.selectedAmenities, amenityId],
    }))
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                First, let's enter your information and contact!
              </h2>
              <p className="text-lg text-gray-700 mb-8">Upload the image of your ID here:</p>

              <div
                onClick={() => idInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-16 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
              >
                <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Click to upload ID image</p>
                {propertyData.idImage && <p className="text-sm text-green-600 mt-2">✓ {propertyData.idImage.name}</p>}
              </div>
              <input ref={idInputRef} type="file" accept="image/*" onChange={handleIdUpload} className="hidden" />
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Provide your contact here:</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 w-16">Email:</span>
                  <Input
                    value={propertyData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="aaaaa.122@gmail.com"
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 w-16">Number:</span>
                  <Input
                    value={propertyData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="0912244444"
                    className="flex-1 border-none shadow-none focus-visible:ring-0"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Which of these best describes your place?</h2>

            <div className="grid grid-cols-5 gap-6">
              {accommodationTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleInputChange("accommodationType", type.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:border-gray-400 ${
                    propertyData.accommodationType === type.id ? "border-gray-900 bg-gray-50" : "border-gray-200"
                  }`}
                >
                  <div className="text-3xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{type.label}</div>
                </button>
              ))}
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Where is your place located?</h2>
              <p className="text-gray-600">Your address will be shared to customers after reservation.</p>
            </div>

            <div className="relative">
              <div className="aspect-video bg-blue-100 rounded-xl relative overflow-hidden">
                {/* Map placeholder */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-200"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-lg shadow-lg">
                    <Input
                      value={propertyData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      placeholder="Enter your address here!"
                      className="w-80"
                    />
                  </div>
                </div>
                {/* Map controls */}
                <div className="absolute bottom-4 right-4 space-y-2">
                  <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <Plus className="h-5 w-5" />
                  </button>
                  <button className="w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <Minus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              Share a little more detailed information about your place
            </h2>

            <div className="space-y-6 max-w-md mx-auto">
              {[
                { field: "guests", label: "Guest(s)" },
                { field: "rooms", label: "Room(s)" },
                { field: "beds", label: "Bed(s)" },
                { field: "restrooms", label: "Rest room(s)" },
              ].map(({ field, label }) => (
                <div key={field} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <span className="text-gray-700 font-medium">{label}:</span>
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleCountChange(field, false)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                      disabled={propertyData[field as keyof typeof propertyData] <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {propertyData[field as keyof typeof propertyData]}
                    </span>
                    <button
                      onClick={() => handleCountChange(field, true)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Upload some pictures of your place:</h2>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-24 text-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50"
            >
              <Plus className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Click to upload images</p>
              {propertyData.images.length > 0 && (
                <p className="text-sm text-green-600 mt-2">✓ {propertyData.images.length} image(s) uploaded</p>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        )

      case 6:
        return (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">What's more do you provide?</h2>
              <p className="text-gray-600">List</p>
            </div>

            <div className="grid grid-cols-5 gap-6">
              {amenities.map((amenity) => (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`p-4 rounded-xl border-2 transition-all hover:border-gray-400 ${
                    propertyData.selectedAmenities.includes(amenity.id)
                      ? "border-gray-900 bg-gray-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="text-2xl mb-2">{amenity.icon}</div>
                  <div className="text-sm font-medium text-gray-700 text-center">{amenity.label}</div>
                </button>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900">Give your place a name and description!</h2>

            <div className="space-y-6">
              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-4">
                  <span className="text-gray-700 font-medium mt-2">Name:</span>
                  <Input
                    value={propertyData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="A cosy homestay for family"
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg"
                  />
                </div>
              </div>

              <div className="p-6 border border-gray-200 rounded-lg">
                <div className="flex items-start space-x-4">
                  <span className="text-gray-700 font-medium mt-2">Description:</span>
                  <textarea
                    value={propertyData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="You will have an amazing time with your family here"
                    className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg resize-none h-24"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-800 font-serif">Sky-high</h1>
              <div className="text-xs text-gray-500">YOUR HOLIDAY</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-0 h-auto">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Step Content */}
          <div className="min-h-[500px]">{renderStepContent()}</div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t">
            {currentStep > 1 ? (
              <Button onClick={handleBack} className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg">
                Back
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 7 ? (
              <Button
                onClick={handleNext}
                className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg"
                disabled={
                  (currentStep === 1 && (!propertyData.email || !propertyData.phone)) ||
                  (currentStep === 2 && !propertyData.accommodationType) ||
                  (currentStep === 3 && !propertyData.address) ||
                  (currentStep === 7 && (!propertyData.name || !propertyData.description))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleFinish}
                className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-3 rounded-lg"
                disabled={!propertyData.name || !propertyData.description}
              >
                Finish!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
