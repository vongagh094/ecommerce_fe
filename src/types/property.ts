import type { PropertyImageAPI } from "./api"

export interface PropertyDetails {
  id: number
  title: string
  description: string | null // Updated to allow null
  location: string // Combined address string
  propertyType: string
  category: string
  status: "ACTIVE" | "INACTIVE" | "DRAFT"
  maxGuests: number
  bedrooms: number | null // Updated to allow null
  bathrooms: number | null // Updated to allow null
  basePrice: number
  cleaningFee: number | null // Updated to allow null
  cancellationPolicy: "FLEXIBLE" | "MODERATE" | "STRICT" | "SUPER_STRICT"
  instantBook: boolean
  minimumStay: number
  images: PropertyImageAPI[] | null // Updated to allow null
  amenities: Amenity[] | null
  host: {
    id: number
    rating: number
  } | null // Updated to allow null
  createdAt: Date
  updatedAt: Date | null // Updated to allow null
  postal_code: string | null // Updated to allow null
  latitude: number | null
  longitude: number | null
  address_line1: string | null // Updated to allow null
  city: string
  state: string | null // Updated to allow null
  country: string
}

export interface PropertyImage {
  id: number | null // Updated to allow null for new images
  url: string | null // Updated to allow null for new images
  isPrimary: boolean
  displayOrder: number
  altText?: string | null // Updated to allow null
  title?: string | null // Updated to allow null
}

export interface Amenity {
  id: string // UUID
  name: string
  category: string
  description?: string | null // Updated to allow null
}

export interface PropertyEditSection {
  id: string
  title: string
  content: any
  type: "text" | "textarea" | "number" | "boolean" | "select" | "amenities" | "images"
}

export interface PropertyType {
  id: number
  name: string
  description?: string | null
}

export interface PropertyCategory {
  id: number
  name: string
  description?: string | null
}
