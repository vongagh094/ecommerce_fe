export interface PropertyAmenityPayload {
  amenity_id: string
}

export interface PropertyAPI {
  id: number
  title: string
  description: string | null // Updated to allow null
  address_line1: string | null // Updated to allow null
  city: string
  state: string | null // Updated to allow null
  country: string
  postal_code: string | null // Updated to allow null
  latitude: number | null
  longitude: number | null
  property_type: string
  category: string
  status: "ACTIVE" | "INACTIVE" | "DRAFT"
  max_guests: number
  bedrooms: number | null // Updated to allow null
  bathrooms: number | null // Updated to allow null
  base_price: number
  cleaning_fee: number | null // Updated to allow null
  cancellation_policy: "FLEXIBLE" | "MODERATE" | "STRICT" | "SUPER_STRICT"
  instant_book: boolean
  minimum_stay: number
  images: PropertyImageAPI[] | null // Updated to allow null
  amenities: string[] | null
  host_id: number
  host?: {
    host_rating_average: number
  } | null // Updated to allow null
  created_at: string
  updated_at: string | null // Updated to allow null
}

export interface PropertyImageAPI {
  id: string | null
  image_url: string | null 
  is_primary: boolean
  display_order: number
  alt_text?: string | null // Updated to allow null
  title?: string | null // Updated to allow null
}

export interface AmenityAPI {
  id: string // UUID
  name: string
  category: string
  description?: string | null // Updated to allow null
}

export interface PropertyTypeAPI {
  id: number
  name: string
  description?: string | null
}

export interface PropertyCategoryAPI {
  id: number
  name: string
  description?: string | null
}

// Define and export the AuctionAPI type
export interface AuctionAPI {
  id: string
  property_id: number
  start_date: string
  end_date: string
  min_nights: number
  max_nights?: number | null
  starting_price: number
  bid_increment: number
  minimum_bid: number
  auction_start_time: string
  auction_end_time: string
  objective: string
  status: string
  total_bids: number
  current_highest_bid?: number | null
  created_at: string
}
