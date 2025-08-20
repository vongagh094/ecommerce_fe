"use client"

import type React from "react"
import { useState, useEffect, useCallback, useRef } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus, Minus, Upload, MapPin, DollarSign, Home, ImageIcon } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import type { PropertyCreationModalProps } from "@/types/modal"
import type { Amenity, PropertyType, PropertyCategory } from "@/types/property"
import type { AmenityAPI, PropertyTypeAPI, PropertyCategoryAPI, PropertyAPI } from "@/types/api"
import AddressMap from "@/components/shared/map"
import type { AddressData } from "@/types/address" // Declare AddressData type

const apiUrl = "http://127.0.0.1:8000"
const HOST_ID = 1
const AMENITIES_PER_PAGE = 50

export function PropertyCreationModal({ isOpen, onClose, onPropertyCreated }: PropertyCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number | null>(null)

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    idImage: null as File | null,
    title: "",
    description: "",
    propertyType: "",
    category: "",
    addressLine1: "",
    city: "",
    state: null as string | null,
    country: "",
    postalCode: null as string | null,
    latitude: null as number | null,
    longitude: null as number | null,
    basePrice: 0,
    cleaningFee: 0,
    cancellationPolicy: "FLEXIBLE" as "FLEXIBLE" | "MODERATE" | "STRICT" | "SUPER_STRICT",
    instantBook: false,
    minimumStay: 1,
    maxGuests: 1,
    bedrooms: 1,
    bathrooms: 1,
    images: [] as File[],
    selectedAmenities: [] as string[],
  })

  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([])
  const [categories, setCategories] = useState<PropertyCategory[]>([])
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([])
  const [displayedAmenities, setDisplayedAmenities] = useState<Amenity[]>([])
  const [amenitySearch, setAmenitySearch] = useState("")
  const [amenityPage, setAmenityPage] = useState(1)
  const [hasMoreAmenities, setHasMoreAmenities] = useState(true)
  const [loadingAmenities, setLoadingAmenities] = useState(false)
  const [loadedAmenityCount, setLoadedAmenityCount] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const idInputRef = useRef<HTMLInputElement>(null)

  const fetchReferenceData = useCallback(async () => {
    setLoading(true)
    try {
      const [typesRes, categoriesRes] = await Promise.all([
        fetch(`${apiUrl}/property-types/available`),
        fetch(`${apiUrl}/property-categories/available`),
      ])

      if (!typesRes.ok || !categoriesRes.ok) {
        throw new Error("Failed to fetch reference data.")
      }

      const typesData: PropertyTypeAPI[] = await typesRes.json()
      const categoriesData: PropertyCategoryAPI[] = await categoriesRes.json()

      const typeIds = typesData.map((t) => t.id)
      const uniqueTypeIds = new Set(typeIds)
      if (typeIds.length !== uniqueTypeIds.size) {
        console.warn("Duplicate IDs found in propertyTypes:", typeIds)
      }

      setPropertyTypes(typesData)
      setCategories(categoriesData)
    } catch (err: any) {
      setError(err.message || "Failed to load form data.")
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAmenities = useCallback(async (query: string, offset: number, limit: number) => {
    setLoadingAmenities(true)
    setError(null)
    try {
      const endpoint = query
        ? `${apiUrl}/property-amenities/search?query=${encodeURIComponent(query)}&offset=${offset}&limit=${limit}`
        : `${apiUrl}/property-amenities/available?offset=${offset}&limit=${limit}`
      const response = await fetch(endpoint)
      if (!response.ok) {
        throw new Error(`Failed to fetch amenities: ${response.statusText}`)
      }
      const data = await response.json()

      const amenitiesData: AmenityAPI[] = data.items || data
      const total: number = data.total || amenitiesData.length

      const mappedAmenities = amenitiesData.map((a) => ({ ...a, id: String(a.id) }))

      setAllAmenities((prev) => {
        const newAmenities = [...prev, ...mappedAmenities].reduce((unique, item) => {
          return unique.some((a) => a.id === item.id) ? unique : [...unique, item]
        }, [] as Amenity[])
        return newAmenities
      })

      setDisplayedAmenities((prev) => {
        if (query) {
          return mappedAmenities
        } else {
          const newAmenities = [...prev, ...mappedAmenities].reduce((unique, item) => {
            return unique.some((a) => a.id === item.id) ? unique : [...unique, item]
          }, [] as Amenity[])
          return newAmenities
        }
      })

      if (!query) {
        setLoadedAmenityCount((prev) => prev + amenitiesData.length)
      }

      setHasMoreAmenities(amenitiesData.length === limit)
    } catch (err: any) {
      console.error("Failed to fetch amenities:", err)
      setError(err.message || "Failed to fetch amenities")
    } finally {
      setLoadingAmenities(false)
    }
  }, [])

  const loadMoreAmenities = () => {
    setAmenityPage((prev) => prev + 1)
  }

  const clearSearch = () => {
    setAmenitySearch("")
    setAmenityPage(1)
    setDisplayedAmenities([])
    setAllAmenities([])
    setLoadedAmenityCount(0)
    setHasMoreAmenities(true)
  }

  const clearAllAmenities = () => {
    setFormData((prev) => ({ ...prev, selectedAmenities: [] }))
  }

  useEffect(() => {
    if (isOpen) {
      fetchReferenceData()
      setCurrentStep(1)
      setFormData({
        email: "",
        phone: "",
        idImage: null,
        title: "",
        description: "",
        propertyType: "",
        category: "",
        addressLine1: "",
        city: "",
        state: null,
        country: "",
        postalCode: null,
        latitude: null,
        longitude: null,
        basePrice: 0,
        cleaningFee: 0,
        cancellationPolicy: "FLEXIBLE",
        instantBook: false,
        minimumStay: 1,
        maxGuests: 1,
        bedrooms: 1,
        bathrooms: 1,
        images: [],
        selectedAmenities: [],
      })
      setError(null)
      setAmenitySearch("")
      setAmenityPage(1)
      setDisplayedAmenities([])
      setAllAmenities([])
      setHasMoreAmenities(true)
      setLoadedAmenityCount(0)
      setSelectedImage(null)
      setPrimaryImageIndex(null)
    }
  }, [isOpen, fetchReferenceData])

  useEffect(() => {
    if (isOpen) {
      fetchAmenities(amenitySearch, (amenityPage - 1) * AMENITIES_PER_PAGE, AMENITIES_PER_PAGE)
    }
  }, [isOpen, amenitySearch, amenityPage, fetchAmenities])

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCountChange = (field: "maxGuests" | "bedrooms" | "bathrooms", increment: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: increment ? prev[field] + 1 : Math.max(1, prev[field] - 1),
    }))
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setFormData((prev) => ({ ...prev, images: [...prev.images, ...files] }))
    }
  }

  const handleIdUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.[0]) {
      setFormData((prev) => ({ ...prev, idImage: event.target.files![0] }))
    }
  }

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
    if (primaryImageIndex === index) {
      setPrimaryImageIndex(null)
    } else if (primaryImageIndex !== null && index < primaryImageIndex) {
      setPrimaryImageIndex((prev) => (prev !== null ? prev - 1 : null))
    }
  }

  const handleSetPrimary = (index: number) => {
    setPrimaryImageIndex(index)
    console.log("Set primary image to index:", index)
  }

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedAmenities: prev.selectedAmenities.includes(amenityId)
        ? prev.selectedAmenities.filter((id) => id !== amenityId)
        : [...prev.selectedAmenities, amenityId],
    }))
  }

  const handleLocationSave = (data: AddressData) => {
    setFormData((prev) => ({
      ...prev,
      addressLine1: data.address,
      city: data.city,
      state: data.state,
      country: data.country,
      postalCode: data.postcode,
      latitude: data.latitude,
      longitude: data.longitude,
    }))
  }

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.email && formData.phone && formData.idImage)
      case 2:
        return !!formData.propertyType
      case 3:
        return !!formData.category
      case 4:
        return !!(formData.latitude && formData.longitude)
      case 5:
        return formData.basePrice > 0
      case 6:
        return formData.maxGuests > 0 && formData.bedrooms >= 0 && formData.bathrooms >= 0
      case 7:
        return formData.images.length > 0
      case 8:
        return true
      case 9:
        return !!(formData.title && formData.description)
      default:
        return true
    }
  }

  const handleSubmit = async (publish = true) => {
    setLoading(true)
    setError(null)
    try {
      const formDataToSend = new FormData()
      const propertyData: PropertyAPI = {
        host_id: HOST_ID,
        title: formData.title,
        description: formData.description || null,
        property_type: formData.propertyType,
        category: formData.category,
        max_guests: formData.maxGuests,
        bedrooms: formData.bedrooms || null,
        bathrooms: formData.bathrooms || null,
        address_line1: formData.addressLine1 || null,
        city: formData.city,
        state: formData.state || null,
        country: formData.country,
        postal_code: formData.postalCode || null,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        base_price: formData.basePrice,
        cleaning_fee: formData.cleaningFee || null,
        cancellation_policy: formData.cancellationPolicy,
        instant_book: formData.instantBook,
        minimum_stay: formData.minimumStay,
        status: publish ? "ACTIVE" : "DRAFT",
        amenities: formData.selectedAmenities,
        images: [],
        id: 0,
        created_at: "",
        updated_at: null,
      }

      if (!propertyData.images) {
        propertyData.images = []
      }

      if (formData.idImage) {
        propertyData.images.push({
          id: null,
          image_url: null,
          alt_text: formData.idImage.name,
          title: formData.idImage.name,
          display_order: 0,
          is_primary: false,
        })
      }

      formData.images.forEach((img, index) => {
        propertyData.images?.push({
          id: null,
          image_url: null,
          alt_text: img.name,
          title: img.name,
          display_order: formData.idImage ? index + 1 : index,
          is_primary: primaryImageIndex === index || (primaryImageIndex === null && index === 0),
        })
      })

      if (primaryImageIndex === null && propertyData.images.length > 0 && !formData.idImage) {
        propertyData.images[0].is_primary = true
      }

      console.group("=== Before Sending Create Request ===")
      console.log("PropertyData (Payload):", JSON.stringify(propertyData, null, 2))
      console.log("FormData Files:", [
        ...(formData.idImage ? [formData.idImage.name] : []),
        ...formData.images.map((file) => file.name),
      ])
      console.log("Number of new images:", propertyData.images.length)
      console.log("Number of images with id: null:", propertyData.images.filter((img) => img.id === null).length)
      console.log("Primary Image Index:", primaryImageIndex)
      console.log("Selected Amenities:", formData.selectedAmenities)
      console.log("FormData Data (JSON):", JSON.stringify(propertyData, null, 2))
      console.groupEnd()

      formDataToSend.append("data", JSON.stringify(propertyData))

      if (formData.idImage) {
        formDataToSend.append("files", formData.idImage)
      }

      formData.images.forEach((file) => {
        formDataToSend.append("files", file)
      })

      const response = await fetch(`${apiUrl}/properties/create`, {
        method: "POST",
        body: formDataToSend,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail?.detail || "Không thể tạo bất động sản")
      }

      const newProperty = await response.json()
      onPropertyCreated(newProperty.id)
      onClose()
    } catch (err: any) {
      setError(err.message || "Không thể tạo bất động sản")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    "Basic Info",
    "Property Type",
    "Category",
    "Location",
    "Pricing & Policy",
    "Details",
    "Images",
    "Amenities",
    "Description",
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
              <p className="text-gray-600 mb-6">Let's start with your contact details and identity verification.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => updateFormData("phone", e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="idImage">Identity Document</Label>
                  <div
                    onClick={() => idInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Click to upload ID document</p>
                  </div>
                  <input
                    ref={idInputRef}
                    id="idImage"
                    type="file"
                    accept="image/*"
                    onChange={handleIdUpload}
                    className="hidden"
                    required
                  />
                  {formData.idImage && (
                    <div className="mt-4 relative group">
                      <img
                        src={URL.createObjectURL(formData.idImage) || "/placeholder.svg"}
                        alt="ID Document"
                        className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => formData.idImage && setSelectedImage(URL.createObjectURL(formData.idImage))}
                      />
                      <button
                        type="button"
                        onClick={() => updateFormData("idImage", null)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <Badge className="absolute bottom-2 left-2 bg-green-100 text-green-800">ID Document</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Property Type</h2>
              <p className="text-gray-600 mb-6">What type of property are you listing?</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {propertyTypes.length === 0 ? (
                  <p className="text-gray-500 col-span-full">No property types available.</p>
                ) : (
                  propertyTypes.map((type, index) => (
                    <button
                      key={type.id ?? `type-${index}`}
                      onClick={() => updateFormData("propertyType", type.name)}
                      className={`p-4 rounded-lg border-2 transition-all hover:border-gray-400 ${
                        formData.propertyType === type.name ? "border-cyan-500 bg-cyan-50" : "border-gray-200"
                      }`}
                    >
                      <Home className="h-8 w-8 mx-auto mb-2 text-gray-600" />
                      <div className="text-sm font-medium">{type.name}</div>
                      {type.description && <div className="text-xs text-gray-500 mt-1">{type.description}</div>}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Property Category</h2>
              <p className="text-gray-600 mb-6">Which category best describes your place?</p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category, index) => (
                  <button
                    key={category.id ?? `category-${index}`}
                    onClick={() => updateFormData("category", category.name)}
                    className={`p-4 rounded-lg border-2 transition-all hover:border-gray-400 ${
                      formData.category === category.name ? "border-cyan-500 bg-cyan-50" : "border-gray-200"
                    }`}
                  >
                    <div className="text-2xl mb-2">🏠</div>
                    <div className="text-sm font-medium">{category.name}</div>
                    {category.description && <div className="text-xs text-gray-500 mt-1">{category.description}</div>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Location</h2>
              <p className="text-gray-600 mb-6">Set your property's location using the map.</p>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span className="text-sm">Map Location</span>
                </div>
                <p className="text-xs text-gray-500 mb-4">
                  Drag the marker or search for an address to set precise coordinates.
                </p>
                <AddressMap
                  addressData={{
                    address: formData.addressLine1,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    postcode: formData.postalCode,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                  }}
                  onSave={handleLocationSave}
                />
                {formData.addressLine1 && (
                  <div className="mt-4 text-sm text-gray-700">
                    <p>
                      <strong>Selected Address:</strong> {formData.addressLine1}, {formData.city},{" "}
                      {formData.state ? `${formData.state}, ` : ""}
                      {formData.postalCode}, {formData.country}
                    </p>
                    <p>
                      <strong>Coordinates:</strong> Lat {formData.latitude?.toFixed(4)}, Lng{" "}
                      {formData.longitude?.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Pricing & Policies</h2>
              <p className="text-gray-600 mb-6">Set your pricing and booking policies.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="basePrice">Base Price per Night</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="basePrice"
                      type="number"
                      value={formData.basePrice}
                      onChange={(e) => updateFormData("basePrice", Number.parseFloat(e.target.value) || 0)}
                      placeholder="100"
                      className="pl-10"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cleaningFee">Cleaning Fee (Optional)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="cleaningFee"
                      type="number"
                      value={formData.cleaningFee}
                      onChange={(e) => updateFormData("cleaningFee", Number.parseFloat(e.target.value) || 0)}
                      placeholder="25"
                      className="pl-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="cancellationPolicy">Cancellation Policy</Label>
                  <Select
                    value={formData.cancellationPolicy}
                    onValueChange={(value) => updateFormData("cancellationPolicy", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FLEXIBLE">Flexible - Full refund 1 day prior</SelectItem>
                      <SelectItem value="MODERATE">Moderate - Full refund 5 days prior</SelectItem>
                      <SelectItem value="STRICT">Strict - 50% refund up until 1 week prior</SelectItem>
                      <SelectItem value="SUPER_STRICT">Super Strict - 50% refund up until 30 days prior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="minimumStay">Minimum Stay (nights)</Label>
                  <Input
                    id="minimumStay"
                    type="number"
                    value={formData.minimumStay}
                    onChange={(e) => updateFormData("minimumStay", Number.parseInt(e.target.value) || 1)}
                    min="1"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Property Details</h2>
              <p className="text-gray-600 mb-6">Tell us about the space and capacity.</p>

              <div className="space-y-6">
                {[
                  { field: "maxGuests", label: "Maximum Guests", icon: "👥" },
                  { field: "bedrooms", label: "Bedrooms", icon: "🛏️" },
                  { field: "bathrooms", label: "Bathrooms", icon: "🚿" },
                ].map(({ field, label, icon }, index) => (
                  <div key={field} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{icon}</span>
                      <span className="font-medium">{label}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Button
                        type="button"
                        onClick={() => handleCountChange(field as "maxGuests" | "bedrooms" | "bathrooms", false)}
                        className="w-16 h-16 rounded-full border-2 border-gray-300 bg-white hover:bg-cyan-200 hover:border-cyan-700 text-gray-800 hover:text-cyan-800 font-bold shadow-sm flex items-center justify-center transition-all"
                        disabled={
                          (formData[field as keyof typeof formData] as number) <= 1 &&
                          field !== "bedrooms" &&
                          field !== "bathrooms"
                        }
                      >
                        <Minus className="h-8 w-8" strokeWidth={3.5} />
                      </Button>
                      <span className="w-8 text-center font-semibold">
                        {formData[field as keyof typeof formData] as number}
                      </span>
                      <Button
                        type="button"
                        onClick={() => handleCountChange(field as "maxGuests" | "bedrooms" | "bathrooms", true)}
                        className="w-16 h-16 rounded-full border-2 border-gray-300 bg-white hover:bg-cyan-200 hover:border-cyan-700 text-gray-800 hover:text-cyan-800 font-bold shadow-sm flex items-center justify-center transition-all"
                      >
                        <Plus className="h-8 w-8" strokeWidth={3.5} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Property Images</h2>
              <p className="text-gray-600 mb-6">Upload high-quality photos of your property.</p>

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
              >
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload images</p>
                <p className="text-sm text-gray-500">Upload multiple images (JPG, PNG, GIF)</p>
                {formData.images.length > 0 && (
                  <Badge className="mt-2 bg-green-100 text-green-800">✓ {formData.images.length} images uploaded</Badge>
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

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image) || "/placeholder.svg"}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer"
                        onClick={() => setSelectedImage(URL.createObjectURL(image))}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {(primaryImageIndex === index || (primaryImageIndex === null && index === 0)) && (
                        <Badge className="absolute bottom-2 left-2 bg-cyan-500 text-white">Primary</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(index)}
                        className={`absolute bottom-2 right-2 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${primaryImageIndex === index ? "bg-gray-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                        disabled={primaryImageIndex === index}
                      >
                        {primaryImageIndex === index ? "Primary" : "Set as Primary"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <p className="text-gray-600 mb-6">Search and select amenities for your property.</p>

              <div className="flex items-center gap-2 mb-4">
                <Input
                  placeholder="Search amenities..."
                  value={amenitySearch}
                  onChange={(e) => {
                    setAmenitySearch(e.target.value)
                    setAmenityPage(1)
                    setDisplayedAmenities([])
                    setAllAmenities([])
                    setLoadedAmenityCount(0)
                  }}
                  className="border-blue-300 max-w-md"
                />
                {amenitySearch && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearSearch}
                    className="text-gray-600 border-gray-300 hover:bg-gray-50 bg-transparent"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear Search
                  </Button>
                )}
                {formData.selectedAmenities.length > 0 && (
                  <Button
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 bg-transparent"
                    onClick={clearAllAmenities}
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-64 overflow-y-auto border rounded-md p-2">
                {loadingAmenities ? (
                  <div className="col-span-full text-center text-gray-500">Loading amenities...</div>
                ) : displayedAmenities.length === 0 ? (
                  <div className="col-span-full text-center text-gray-500">No amenities found</div>
                ) : (
                  displayedAmenities.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`p-3 rounded-lg border-2 transition-all text-left ${formData.selectedAmenities.includes(amenity.id) ? "border-blue-600 bg-blue-100" : "border-gray-200 hover:border-gray-300"}`}
                    >
                      <div className="text-sm font-medium">{amenity.name}</div>
                      <div className="text-xs text-gray-500">{amenity.category}</div>
                    </button>
                  ))
                )}
              </div>

              {hasMoreAmenities && !amenitySearch && (
                <Button
                  onClick={loadMoreAmenities}
                  className="w-full mt-4 bg-blue-100 text-blue-800 hover:bg-blue-200"
                  disabled={loadingAmenities}
                >
                  Load More
                </Button>
              )}

              {formData.selectedAmenities.length > 0 && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Selected Amenities ({formData.selectedAmenities.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedAmenities.map((amenityId) => {
                      const amenity = allAmenities.find((a) => a.id === amenityId)
                      return amenity ? (
                        <Badge
                          key={amenityId}
                          className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                          onClick={() => toggleAmenity(amenityId)}
                        >
                          {amenity.name} ×
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Title & Description</h2>
              <p className="text-gray-600 mb-6">Create an appealing title and description for your property.</p>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Property Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => updateFormData("title", e.target.value)}
                    placeholder="Cozy downtown apartment with city views"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100 characters</p>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => updateFormData("description", e.target.value)}
                    placeholder="Describe your space, what makes it special, and what guests can expect..."
                    rows={6}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/1000 characters</p>
                </div>
              </div>

              <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Preview</h3>
                <div className="bg-white p-4 rounded-lg">
                  <h4 className="font-semibold text-lg mb-2">{formData.title || "Your Property Title"}</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    {formData.city && formData.country ? `${formData.city}, ${formData.country}` : "Location"}
                  </p>
                  <p className="text-gray-700 text-sm">
                    {formData.description || "Your property description will appear here..."}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formData.maxGuests} guests • {formData.bedrooms} bedrooms • {formData.bathrooms} bathrooms
                    </span>
                    <span className="font-semibold">${formData.basePrice}/night</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <VisuallyHidden>
          <DialogTitle>Create New Property</DialogTitle>
        </VisuallyHidden>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create New Property</h1>
              <p className="text-gray-600">
                Step {currentStep} of {steps.length}: {steps[currentStep - 1]}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mb-8">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={`text-xs ${index + 1 <= currentStep ? "text-cyan-600 font-medium" : "text-gray-400"}`}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>

          <div className="min-h-[400px] relative">
            {loading ? (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
                  <p className="text-lg font-medium text-gray-900 mb-2">Đang tạo bất động sản...</p>
                  <p className="text-sm text-gray-600">Vui lòng đợi, quá trình này có thể mất vài phút</p>
                </div>
              </div>
            ) : null}
            <div className={loading ? "opacity-50 pointer-events-none" : ""}>{renderStepContent()}</div>
          </div>

          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <VisuallyHidden>
              <DialogTitle>Zoomed Image</DialogTitle>
            </VisuallyHidden>
            <DialogContent className="max-w-4xl p-0">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Zoomed image"
                className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              />
            </DialogContent>
          </Dialog>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className={`flex justify-between pt-6 border-t ${loading ? "opacity-50" : ""}`}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || loading}
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === steps.length ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSubmit(false)}
                    disabled={loading || !validateStep(currentStep)}
                    className="relative"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent mr-2"></div>
                        Đang lưu nháp...
                      </>
                    ) : (
                      "Save as Draft"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmit(true)}
                    disabled={loading || !validateStep(currentStep)}
                    className="bg-cyan-500 hover:bg-cyan-600 relative"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Đang xuất bản...
                      </>
                    ) : (
                      "Publish Property"
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
                  disabled={!validateStep(currentStep) || loading}
                  className="bg-cyan-500 hover:bg-cyan-600"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
