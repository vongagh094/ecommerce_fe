"use client"

import type React from "react"
import type { PropertyAPI, PropertyImageAPI, AmenityAPI } from "@/types/api"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { DeleteConfirmModal } from "@/components/host/delete-confirm-modal"
import type { PropertyDetails, Amenity } from "@/types/property"
import type { AddressData } from "@/types/address"

import { PropertyHeader } from "@/components/host/property-header"
import { ImageGallery } from "@/components/host/image-gallery"
import { PropertyDetailsSection } from "@/components/host/property-details-section"
import { PricingSection } from "@/components/host/pricing-section"
import { AmenitiesSection } from "@/components/host/amenities-section"
import { LocationSection } from "@/components/host/location-section"
import { BookingSection } from "@/components/host/booking-section"

const apiUrl = "http://127.0.0.1:8000"
const AMENITIES_PER_PAGE = 50

interface PropertyUpdatePayload {
  title?: string
  description?: string
  property_type?: string
  category?: string
  max_guests?: number
  bedrooms?: number
  bathrooms?: number
  address_line1?: string
  city?: string
  state?: string
  country?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  base_price?: number
  cleaning_fee?: number
  cancellation_policy?: string
  instant_book?: boolean
  minimum_stay?: number
  home_tier?: number
  is_guest_favorite?: boolean
  language?: string
  status?: string
  amenities?: string[]
  images?: Array<{
    id?: string | null
    image_url?: string
    alt_text?: string
    title?: string
    display_order: number
    is_primary: boolean
  }>
  deletedImageIds?: string[]
}

export default function PropertyDetailsPage() {
  const params = useParams()
  const propertyId = Number(params.id)

  const [property, setProperty] = useState<PropertyDetails | null>(null)
  const [editingData, setEditingData] = useState<Partial<PropertyDetails>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteModal, setDeleteModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  const [newImages, setNewImages] = useState<File[]>([])
  const [newIdImage, setNewIdImage] = useState<File | null>(null)
  const [deletedImageIds, setDeletedImageIds] = useState<string[]>([])

  const [allAmenities, setAllAmenities] = useState<AmenityAPI[]>([])
  const [displayedAmenities, setDisplayedAmenities] = useState<AmenityAPI[]>([])
  const [amenitySearch, setAmenitySearch] = useState("")
  const [amenityPage, setAmenityPage] = useState(1)
  const [hasMoreAmenities, setHasMoreAmenities] = useState(true)
  const [loadingAmenities, setLoadingAmenities] = useState(false)
  const [loadedAmenityCount, setLoadedAmenityCount] = useState(0)

  const [imageSelectionOrder, setImageSelectionOrder] = useState<number[]>([])
  const [isSelectingOrder, setIsSelectingOrder] = useState(false)
  const [newImagesPrimary, setNewImagesPrimary] = useState<number | null>(null)
  const [newImagesDisplayOrder, setNewImagesDisplayOrder] = useState<number[]>([])

  const router = useRouter()

  const validateImages = (images: PropertyImageAPI[]): boolean => {
    return images.some((img) => img.display_order === 0)
  }

  const updateEditingData = (field: string, value: any) => {
    setEditingData((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    if (propertyId) {
      fetchProperty()
    }
  }, [propertyId])

  useEffect(() => {
    fetchAmenities(amenitySearch, (amenityPage - 1) * AMENITIES_PER_PAGE, AMENITIES_PER_PAGE)
  }, [amenitySearch, amenityPage])

  useEffect(() => {
    const hasAnyChanges =
      Object.keys(editingData).length > 0 || newImages.length > 0 || !!newIdImage || deletedImageIds.length > 0
    setHasChanges(hasAnyChanges)
  }, [editingData, newImages, newIdImage, deletedImageIds])

  const fetchProperty = async () => {
    if (!propertyId) return

    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${apiUrl}/properties/${propertyId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to fetch property: ${response.statusText}`)
      }
      const data: PropertyAPI = await response.json()

      // Lọc bỏ các mục images có id: null
      const validImages = (data.images || []).filter((img) => img.id !== null && img.image_url)

      const mappedProperty: PropertyDetails = {
        id: data.id,
        title: data.title,
        description: data.description || "",
        location: `${data.address_line1 || ""}, ${data.city}${data.state ? `, ${data.state}` : ""}${data.country ? `, ${data.country}` : ""}`,
        propertyType: data.property_type,
        category: data.category,
        status: data.status,
        maxGuests: data.max_guests || 1,
        bedrooms: data.bedrooms || 0,
        bathrooms: data.bathrooms || 0,
        basePrice: data.base_price,
        cleaningFee: data.cleaning_fee || 0,
        cancellationPolicy: data.cancellation_policy,
        instantBook: data.instant_book || false,
        minimumStay: data.minimum_stay || 1,
        images: validImages,
        amenities: (data.amenities || []).map((a: any) =>
          typeof a === "string" ? { id: a, name: a, category: "" } : a,
        ),
        host: {
          id: data.host_id || 1,
          rating: data.host?.host_rating_average || 0,
        },
        createdAt: new Date(data.created_at),
        updatedAt: data.updated_at ? new Date(data.updated_at) : null,
        postal_code: data.postal_code,
        latitude: data.latitude,
        longitude: data.longitude,
        address_line1: data.address_line1,
        city: data.city,
        state: data.state,
        country: data.country,
      }

      setProperty(mappedProperty)
      setEditingData({})
      setEditingSections(new Set())
      setNewImages([])
      setNewIdImage(null)
      setDeletedImageIds([])
    } catch (err: any) {
      setError(err.message || "Failed to load property")
    } finally {
      setLoading(false)
    }
  }

  const fetchAmenities = async (query: string, offset: number, limit: number) => {
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

      setAllAmenities((prev) => {
        const newAmenities = [...prev, ...amenitiesData].reduce((unique, item) => {
          return unique.some((a) => a.id === item.id) ? unique : [...unique, item]
        }, [] as AmenityAPI[])
        return newAmenities
      })

      setDisplayedAmenities((prev) => {
        if (query) {
          return amenitiesData
        } else {
          const newAmenities = [...prev, ...amenitiesData].reduce((unique, item) => {
            return unique.some((a) => a.id === item.id) ? unique : [...unique, item]
          }, [] as AmenityAPI[])
          return newAmenities
        }
      })

      if (!query) {
        setLoadedAmenityCount((prev) => prev + amenitiesData.length)
      }

      setHasMoreAmenities(amenitiesData.length === limit)
    } catch (err: any) {
      setError(err.message || "Failed to fetch amenities")
    } finally {
      setLoadingAmenities(false)
    }
  }

  const loadMoreAmenities = () => {
    setAmenityPage((prev) => prev + 1)
  }

  const clearAllAmenities = () => {
    updateEditingData("amenities", [])
  }

  const clearSearch = () => {
    setAmenitySearch("")
    setAmenityPage(1)
    setDisplayedAmenities([])
    setAllAmenities([])
    fetchAmenities("", 0, loadedAmenityCount || AMENITIES_PER_PAGE)
  }

  const handleEdit = (section: string) => {
    setEditingSections((prev) => new Set([...prev, section]))
    if (property) {
      if (section === "details") {
        setEditingData((prev) => ({
          ...prev,
          maxGuests: prev.maxGuests ?? property.maxGuests,
          bedrooms: prev.bedrooms ?? property.bedrooms,
          bathrooms: prev.bathrooms ?? property.bathrooms,
          minimumStay: prev.minimumStay ?? property.minimumStay,
        }))
      } else if (section === "pricing") {
        setEditingData((prev) => ({
          ...prev,
          basePrice: prev.basePrice ?? property.basePrice,
          cleaningFee: prev.cleaningFee ?? property.cleaningFee,
        }))
      } else if (section === "amenities") {
        setEditingData((prev) => ({
          ...prev,
          amenities: prev.amenities ?? property.amenities,
        }))
      } else if (section === "description") {
        setEditingData((prev) => ({
          ...prev,
          description: prev.description ?? property.description,
        }))
      } else if (section === "title") {
        setEditingData((prev) => ({
          ...prev,
          title: prev.title ?? property.title,
        }))
      } else if (section === "location") {
        setEditingData((prev) => ({
          ...prev,
          address_line1: prev.address_line1 ?? property.address_line1,
          city: prev.city ?? property.city,
          state: prev.state ?? property.state,
          country: prev.country ?? property.country,
          postal_code: prev.postal_code ?? property.postal_code,
          latitude: prev.latitude ?? property.latitude,
          longitude: prev.longitude ?? property.longitude,
        }))
      } else if (section === "images") {
        const validImages = (property.images || []).filter((img) => img.id !== null && img.image_url)
        setEditingData((prev) => ({
          ...prev,
          images: validImages,
        }))
        setNewImages([])
        setNewIdImage(null)
        setDeletedImageIds([])
      }
    }
  }

  const handleCancelEdit = (section: string) => {
    setEditingSections((prev) => {
      const newSet = new Set(prev)
      newSet.delete(section)
      return newSet
    })
    setEditingData((prev) => {
      const newData = { ...prev }
      if (section === "details") {
        delete newData.maxGuests
        delete newData.bedrooms
        delete newData.bathrooms
        delete newData.minimumStay
      } else if (section === "pricing") {
        delete newData.basePrice
        delete newData.cleaningFee
      } else if (section === "amenities") {
        delete newData.amenities
      } else if (section === "description") {
        delete newData.description
      } else if (section === "title") {
        delete newData.title
      } else if (section === "location") {
        delete newData.address_line1
        delete newData.city
        delete newData.state
        delete newData.country
        delete newData.postal_code
        delete newData.latitude
        delete newData.longitude
      } else if (section === "images") {
        delete newData.images
        setNewImages([])
        setNewIdImage(null)
        setDeletedImageIds([])
      }
      return newData
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files)
      setNewImages(files)
    }
  }

  const handleIdImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      setNewIdImage(file)
    }
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const removeExistingImage = (index: number) => {
    if (!property) return
    const currentImages = (editingData.images as PropertyImageAPI[] | null) || property.images || []
    if (currentImages[index].display_order === 0 && property.status === "ACTIVE") {
      setError("Cannot remove identity image in ACTIVE status")
      return
    }
    const imageToRemove = currentImages[index]
    let updatedImages = currentImages.filter((_, i) => i !== index)

    if (!validateImages(updatedImages) && property.status === "DRAFT") {
      setError("At least one identity image is required")
      return
    }

    const identityImage = updatedImages.find((img) => img.display_order === 0)
    const nonIdentityImages = updatedImages.filter((img) => img.display_order !== 0)
    const reindexedNonIdentity = nonIdentityImages.map((img, idx) => ({
      ...img,
      display_order: idx + 1,
    }))

    updatedImages = identityImage ? [identityImage, ...reindexedNonIdentity] : reindexedNonIdentity

    if (imageToRemove.id) {
      setDeletedImageIds((prev) => [...prev, imageToRemove.id as string])
    }
    updateEditingData("images", updatedImages)
  }

  const handleSetPrimary = (index: number) => {
    const currentImages = (editingData.images as PropertyImageAPI[] | null) || property?.images || []

    if (index < 0 || index >= currentImages.length || currentImages[index].display_order === 0) {
      setError("Identity image cannot be set as primary")
      return
    }

    setNewImagesPrimary(null)

    const updatedImages = currentImages.map((img, idx) => ({
      ...img,
      is_primary: idx === index && img.display_order !== 0,
    }))
    updateEditingData("images", updatedImages)
  }

  const handleImageSelection = (index: number, isNewImage = false) => {
    if (isNewImage) {
      const newImageIndex = index + 1000
      if (imageSelectionOrder.includes(newImageIndex)) {
        setImageSelectionOrder((prev) => prev.filter((i) => i !== newImageIndex))
      } else {
        setImageSelectionOrder((prev) => [...prev, newImageIndex])
      }
      return
    }

    const currentImages = (editingData.images as PropertyImageAPI[] | null) || property?.images || []
    const nonIdentityImages = currentImages.filter((img) => img.display_order !== 0)

    if (index < 0 || index >= nonIdentityImages.length) return

    const currentImage = nonIdentityImages[index]
    if (!currentImage) return

    if (imageSelectionOrder.includes(index)) {
      setImageSelectionOrder((prev) => prev.filter((i) => i !== index))
    } else {
      setImageSelectionOrder((prev) => [...prev, index])
    }
  }

  const handleSetPrimaryNewImage = (index: number) => {
    if (editingData.images) {
      setEditingData({
        ...editingData,
        images: editingData.images.map((img) => ({ ...img, is_primary: false })),
      })
    }

    setNewImagesPrimary(index)
  }

  const applySelectionOrder = () => {
    const currentImages = (editingData.images as PropertyImageAPI[] | null) || property?.images || []
    const identityImage = currentImages.find((img) => img.display_order === 0)
    const nonIdentityImages = currentImages.filter((img) => img.display_order !== 0)

    const allItemsToSort: Array<{ type: "existing" | "new"; index: number; item: PropertyImageAPI | File }> = []

    nonIdentityImages.forEach((img, idx) => {
      allItemsToSort.push({ type: "existing", index: idx, item: img })
    })

    newImages.forEach((file, idx) => {
      allItemsToSort.push({ type: "new", index: idx, item: file })
    })

    const sortedItems: Array<{ type: "existing" | "new"; index: number; item: PropertyImageAPI | File }> = []

    imageSelectionOrder.forEach((selectedIndex, newOrder) => {
      if (selectedIndex >= 1000) {
        const newImageIndex = selectedIndex - 1000
        const newImageItem = allItemsToSort.find((item) => item.type === "new" && item.index === newImageIndex)
        if (newImageItem) {
          sortedItems[newOrder] = newImageItem
        }
      } else {
        const existingImageItem = allItemsToSort.find(
          (item) => item.type === "existing" && item.index === selectedIndex,
        )
        if (existingImageItem) {
          sortedItems[newOrder] = existingImageItem
        }
      }
    })

    allItemsToSort.forEach((item) => {
      if (!sortedItems.includes(item)) {
        sortedItems.push(item)
      }
    })

    const reorderedExistingImages: PropertyImageAPI[] = []
    const reorderedNewImages: File[] = []

    sortedItems.forEach((sortedItem, index) => {
      if (sortedItem.type === "existing") {
        const img = sortedItem.item as PropertyImageAPI
        reorderedExistingImages.push({
          ...img,
          display_order: index + 1,
        })
      } else {
        reorderedNewImages.push(sortedItem.item as File)
      }
    })

    const hasPrimary = reorderedExistingImages.some((img) => img.is_primary) || newImagesPrimary !== null
    if (!hasPrimary && reorderedExistingImages.length > 0) {
      reorderedExistingImages[0].is_primary = true
    }

    const finalImages = identityImage
      ? [{ ...identityImage, display_order: 0 }, ...reorderedExistingImages]
      : reorderedExistingImages

    updateEditingData("images", finalImages)

    const newImagesOrder: number[] = []
    sortedItems.forEach((sortedItem, index) => {
      if (sortedItem.type === "new") {
        newImagesOrder.push(index + 1)
      }
    })

    setNewImagesDisplayOrder(newImagesOrder)
    setNewImages([...reorderedNewImages])

    setTimeout(() => {
      setEditingData({ ...editingData, images: finalImages })
    }, 0)

    setImageSelectionOrder([])
    setIsSelectingOrder(false)
  }

  const cancelSelectionOrder = () => {
    setImageSelectionOrder([])
    setIsSelectingOrder(false)
  }

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = (editingData.amenities as Amenity[] | null) || property?.amenities || []
    const isSelected = currentAmenities.some((a) => a.id === amenityId)

    let updatedAmenities: Amenity[]
    if (isSelected) {
      updatedAmenities = currentAmenities.filter((a) => a.id !== amenityId)
    } else {
      const amenityToAdd = allAmenities.find((a) => a.id === amenityId)
      if (amenityToAdd) {
        updatedAmenities = [...currentAmenities, amenityToAdd]
      } else {
        updatedAmenities = currentAmenities
      }
    }
    updateEditingData("amenities", updatedAmenities)
  }

  const handleLocationSave = (data: AddressData) => {
    updateEditingData("address_line1", data.address)
    updateEditingData("city", data.city)
    updateEditingData("state", data.state)
    updateEditingData("country", data.country)
    updateEditingData("postal_code", data.postcode)
    updateEditingData("latitude", data.latitude)
    updateEditingData("longitude", data.longitude)
  }

  const handleSaveAll = async () => {
    if (!property || !editingData) return

    setSaving(true)
    setError(null)

    try {
      const formData = new FormData()

      // Chuẩn bị images
      const currentImages = (editingData.images as PropertyImageAPI[] | null) || property?.images || []
      const validCurrentImages = currentImages.filter((img) => img.id !== null && img.image_url)
      let updatedImages: PropertyImageAPI[] = [...validCurrentImages]

      const filesToUpload: File[] = []
      const newImageDataList: PropertyImageAPI[] = []

      // Xử lý newIdImage
      if (newIdImage) {
        const idImageIndex = updatedImages.findIndex((img) => img.display_order === 0)
        const newIdImageData: PropertyImageAPI = {
          id: null,
          image_url: null,
          is_primary: false,
          display_order: 0,
          alt_text: newIdImage.name,
          title: newIdImage.name,
        }
        if (idImageIndex >= 0) {
          if (updatedImages[idImageIndex].id) {
            setDeletedImageIds((prev) => [...prev, updatedImages[idImageIndex].id!])
          }
          updatedImages[idImageIndex] = newIdImageData
        } else {
          updatedImages = [newIdImageData, ...updatedImages]
        }
        filesToUpload.push(newIdImage)
        newImageDataList.push(newIdImageData)
      }

      if (newImages.length > 0) {
        const newImagesData = newImages.map((file, index) => ({
          id: null,
          image_url: null,
          is_primary: newImagesPrimary === index,
          display_order:
            newImagesDisplayOrder[index] ||
            Math.max(...updatedImages.map((img) => img.display_order || 0), 0) + index + 1,
          alt_text: file.name,
          title: file.name,
        }))
        updatedImages = [...updatedImages, ...newImagesData]
        filesToUpload.push(...newImages)
        newImageDataList.push(...newImagesData)
      }

      const existingImages = updatedImages.filter((img) => img.id !== null)
      const newImagesOnly = updatedImages.filter((img) => img.id === null)

      // Validate số lượng files khớp với ảnh mới
      if (newImagesOnly.length !== filesToUpload.length) {
        throw new Error(
          `Số lượng image_data mới (${newImagesOnly.length}) không khớp với số lượng file (${filesToUpload.length})`,
        )
      }

      filesToUpload.forEach((file) => {
        formData.append("files", file)
      })

      // Chuẩn bị payload
      const amenitiesIds = editingData.amenities
        ? (editingData.amenities as Amenity[]).map((amenity) => amenity.id)
        : undefined

      const payload: PropertyUpdatePayload = {
        title: editingData.title,
        description: editingData.description ?? undefined,
        property_type: editingData.propertyType,
        category: editingData.category,
        max_guests: editingData.maxGuests,
        bedrooms: editingData.bedrooms ?? undefined,
        bathrooms: editingData.bathrooms ?? undefined,
        address_line1: editingData.address_line1 ?? undefined,
        city: editingData.city,
        state: editingData.state ?? undefined,
        country: editingData.country,
        postal_code: editingData.postal_code ?? undefined,
        latitude: editingData.latitude ?? undefined,
        longitude: editingData.longitude ?? undefined,
        base_price: editingData.basePrice,
        cleaning_fee: editingData.cleaningFee ?? undefined,
        cancellation_policy: editingData.cancellationPolicy,
        instant_book: editingData.instantBook,
        minimum_stay: editingData.minimumStay,
        amenities: amenitiesIds,
        images: [...existingImages, ...newImagesOnly].map((img) => ({
          id: img.id,
          image_url: img.image_url || undefined,
          alt_text: img.alt_text ?? undefined,
          title: img.title ?? undefined,
          display_order: img.display_order,
          is_primary: img.is_primary,
        })),
        deletedImageIds: deletedImageIds,
      }

      Object.keys(payload).forEach((key) => {
        if (payload[key as keyof PropertyUpdatePayload] === undefined) {
          delete payload[key as keyof PropertyUpdatePayload]
        }
      })

      // Gửi request
      formData.append("data", JSON.stringify(payload))

      const response = await fetch(`${apiUrl}/properties/update/${propertyId}`, {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to update property")
      }

      const updatedProperty: PropertyAPI = await response.json()
      const validUpdatedImages = (updatedProperty.images || []).filter((img) => img.id !== null && img.image_url)

      setProperty({
        ...updatedProperty,
        location: `${updatedProperty.address_line1 || ""}, ${updatedProperty.city}, ${updatedProperty.state || ""}, ${updatedProperty.country}`,
        propertyType: updatedProperty.property_type,
        maxGuests: updatedProperty.max_guests,
        basePrice: updatedProperty.base_price,
        cleaningFee: updatedProperty.cleaning_fee,
        cancellationPolicy: updatedProperty.cancellation_policy,
        instantBook: updatedProperty.instant_book,
        minimumStay: updatedProperty.minimum_stay,
        createdAt: new Date(updatedProperty.created_at),
        updatedAt: updatedProperty.updated_at ? new Date(updatedProperty.updated_at) : null,
        host: updatedProperty.host
          ? { id: updatedProperty.host_id, rating: updatedProperty.host.host_rating_average }
          : null,
        amenities: updatedProperty.amenities
          ? updatedProperty.amenities.map((id) => {
              const amenity = allAmenities.find((amenity) => amenity.id === id)
              return (
                amenity || {
                  id,
                  name: `Amenity ${id}`,
                  category: "Unknown",
                }
              )
            })
          : null,
        images: validUpdatedImages,
        address_line1: updatedProperty.address_line1,
        city: updatedProperty.city,
        state: updatedProperty.state,
        country: updatedProperty.country,
        postal_code: updatedProperty.postal_code,
        latitude: updatedProperty.latitude,
        longitude: updatedProperty.longitude,
      })

      setEditingData({})
      setEditingSections(new Set())
      setHasChanges(false)
      setNewImages([])
      setNewIdImage(null)
      setDeletedImageIds([])
      setNewImagesPrimary(null)
      setNewImagesDisplayOrder([])
    } catch (err: any) {
      setError(err.message || "An error occurred while saving the property")
    } finally {
      setSaving(false)
    }
  }

  const handleStatusToggle = async () => {
    if (!property) return

    const newStatus = property.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      const formDataToSend = new FormData()
      formDataToSend.append("data", JSON.stringify({ status: newStatus }))

      const response = await fetch(`${apiUrl}/properties/update/${property.id}`, {
        method: "PUT",
        body: formDataToSend,
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Không thể cập nhật trạng thái: ${response.statusText}`)
      }
      const updatedProperty: PropertyAPI = await response.json() // Get updated property from response
      setProperty({
        ...property,
        status: updatedProperty.status,
      }) // Use full updated property instead of just status
    } catch (err: any) {
      setError(err.message || "Không thể cập nhật trạng thái")
    }
  }

  const handleDelete = async () => {
    if (!property) return

    try {
      const response = await fetch(`${apiUrl}/properties/delete/${property.id}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Không thể xóa bất động sản: ${response.statusText}`)
      }
      router.push("/host/properties")
    } catch (err: any) {
      setError(err.message || "Không thể xóa bất động sản")
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

  const getCurrentValue = (field: string) => {
    return editingData[field as keyof PropertyDetails] ?? property?.[field as keyof PropertyDetails]
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Không tìm thấy bất động sản"}</p>
          <Link href="/host/properties">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách bất động sản
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PropertyHeader
        property={property}
        editingData={editingData}
        editingSections={editingSections}
        hasChanges={hasChanges}
        saving={saving}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onUpdateEditingData={updateEditingData}
        onSaveAll={handleSaveAll}
        onStatusToggle={handleStatusToggle}
        onDelete={() => setDeleteModal(true)}
        getCurrentValue={getCurrentValue}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <ImageGallery
        property={property}
        editingData={editingData}
        editingSections={editingSections}
        newImages={newImages}
        newIdImage={newIdImage}
        deletedImageIds={deletedImageIds}
        imageSelectionOrder={imageSelectionOrder}
        isSelectingOrder={isSelectingOrder}
        newImagesPrimary={newImagesPrimary}
        newImagesDisplayOrder={newImagesDisplayOrder}
        onEdit={handleEdit}
        onCancelEdit={handleCancelEdit}
        onImageUpload={handleImageUpload}
        onIdImageUpload={handleIdImageUpload}
        onRemoveNewImage={removeNewImage}
        onRemoveExistingImage={removeExistingImage}
        onSetPrimary={handleSetPrimary}
        onSetPrimaryNewImage={handleSetPrimaryNewImage}
        onImageSelection={handleImageSelection}
        onApplySelectionOrder={applySelectionOrder}
        onCancelSelectionOrder={cancelSelectionOrder}
        setIsSelectingOrder={setIsSelectingOrder}
        setError={setError}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="pricing">Giá cả</TabsTrigger>
          <TabsTrigger value="amenities">Tiện nghi</TabsTrigger>
          <TabsTrigger value="location">Vị trí</TabsTrigger>
          <TabsTrigger value="bookings">Đặt phòng</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <PropertyDetailsSection
            property={property}
            editingData={editingData}
            editingSections={editingSections}
            onEdit={handleEdit}
            onCancelEdit={handleCancelEdit}
            onUpdateEditingData={updateEditingData}
            getCurrentValue={getCurrentValue}
          />
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <PricingSection
            property={property}
            editingData={editingData}
            editingSections={editingSections}
            onEdit={handleEdit}
            onCancelEdit={handleCancelEdit}
            onUpdateEditingData={updateEditingData}
            getCurrentValue={getCurrentValue}
          />
        </TabsContent>

        <TabsContent value="amenities" className="space-y-6">
          <AmenitiesSection
            property={property}
            editingData={editingData}
            editingSections={editingSections}
            displayedAmenities={displayedAmenities}
            amenitySearch={amenitySearch}
            hasMoreAmenities={hasMoreAmenities}
            loadingAmenities={loadingAmenities}
            onEdit={handleEdit}
            onCancelEdit={handleCancelEdit}
            onUpdateEditingData={updateEditingData}
            getCurrentValue={getCurrentValue}
            onAmenitySearchChange={(e) => setAmenitySearch(e.target.value)}
            onToggleAmenity={toggleAmenity}
            onLoadMoreAmenities={loadMoreAmenities}
            onClearAllAmenities={clearAllAmenities}
            onClearSearch={clearSearch}
          />
        </TabsContent>

        <TabsContent value="location" className="space-y-6">
          <LocationSection
            property={property}
            editingData={editingData}
            editingSections={editingSections}
            onEdit={handleEdit}
            onCancelEdit={handleCancelEdit}
            onLocationSave={handleLocationSave}
            getCurrentValue={getCurrentValue}
          />
        </TabsContent>

        
        <TabsContent value="bookings" className="space-y-6">
          <BookingSection propertyId={propertyId} apiUrl={apiUrl} />
        </TabsContent>
      </Tabs>

      <DeleteConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDelete}
        propertyTitle={property.title}
      />
    </div>
  )
}
