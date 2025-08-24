export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar?: string;
  role: "traveller" | "host" | "admin";
  createdAt: Date;
  updatedAt: Date;
}

export interface Property {
  id: string;
  title: string;
  description: string | null;
  property_type: string;
  category: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: string;
  longitude: string;
  base_price: number;
  cleaning_fee?: number;
  service_fee?: number;
  cancellation_policy: string;
  instant_book: boolean;
  minimum_stay: number;
  maximum_stay?: number;
  check_in_time?: string;
  check_out_time?: string;
  status: string;
  hostId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WishlistProperty {
  wishlist_id: string;
  property_id: string;
  added_at: string;
  property: {
    id: string;
    title: string;
    base_price: number;
  };
}

export interface Wishlist {
  id: string;
  user_id: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  properties: WishlistProperty[];
}

export interface WishlistResponseDTO {
  property_ids: number[];
}

export interface PropertyDisplay {
  id: string;
  title: string;
  price: string;
  rating: number;
  nights: number;
  image: string;
  isFavorite: boolean;
  isGuestFavorite: boolean;
}

// Enhanced types for API integration
export interface PropertyCard {
  id: string; // Backend uses integer IDs
  title: string;
  images: PropertyImage[];
  base_price: number;
  cleaning_fee: number;
  service_fee: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  rating: {
    average: string;
    count: number;
  };
  property_type: string;
  max_guests: number;
  is_guest_favorite: boolean;
  host: {
    id: string;
    full_name: string;
    is_super_host: boolean;
  };
}

export interface PropertyImage {
  id: string;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  display_order: number;
}

export interface SearchParams {
  // Basic search
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;

  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sort_by?: 'price' | 'rating' | 'distance' | 'popularity' | 'newest';
  sort_order?: 'asc' | 'desc';

  // Location-based
  latitude?: number;
  longitude?: number;
  radius?: number;

  // Bidding mode
  mode?: 'standard' | 'bidding';
}

export interface FilterParams extends SearchParams {
  // Price filtering
  min_price?: number;
  max_price?: number;

  // Property characteristics
  property_types?: string[];
  categories?: string[];
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;

  // Amenities
  amenities?: string[];
  amenity_categories?: string[];

  // Host & Quality filters
  superhost_only?: boolean;
  instant_book_only?: boolean;
  guest_favorites_only?: boolean;
  min_rating?: number;
  min_review_count?: number;

  // Booking policies
  cancellation_policies?: string[];
  min_stay?: number;
  max_stay?: number;

  // Accessibility
  accessible?: boolean;

  // Special features
  has_pool?: boolean;
  has_wifi?: boolean;
  has_parking?: boolean;
  has_kitchen?: boolean;
  has_ac?: boolean;
  has_heating?: boolean;

  // Date-specific pricing
  flexible_dates?: boolean;
}

export interface SearchResponse {
  properties: PropertyDetails[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    available_categories: string[];
    price_range: { min: number; max: number };
    available_amenities: string[];
    location_suggestions: string[];
  };
  search_metadata: {
    query_time_ms: number;
    total_found: number;
    location_detected?: {
      city: string;
      state: string;
      country: string;
      coordinates?: [number, number];
    };
  };
  // Backward compatibility
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface Category {
  name: string;
  display_name: string;
  property_count: number;
}

export interface Amenity {
  id: string; // UUID from backend
  name: string;
  category: string;
  created_at: string;
}

export interface PropertyDetails {
  id: string; // Backend uses integer IDs
  title: string;
  description: string;
  property_type: string;
  category: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  rating: {
    average: string;
    count: number;
  };
  location: {
    address_line1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
  base_price: number;
  cleaning_fee: number;
  service_fee: number;
  policies: {
    cancellation_policy: string;
    instant_book: boolean;
    minimum_stay: number;
    check_in_time: string;
    check_out_time: string;
  };
  images: PropertyImage[];
  amenities: Amenity[];
  highlights: PropertyHighlight[];
  house_rules: HouseRule[];
  location_descriptions: LocationDescription[];
  host: HostProfile;
  reviews: ReviewSummary;
  availability_calendar: AvailabilityCalendar;
  active_auctions: AuctionInfo[];
}

export interface PropertyHighlight {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface HouseRule {
  id: string;
  rule_type: string;
  title: string;
  description: string;
}

export interface LocationDescription {
  id: string;
  description_type: string;
  title: string;
  description: string;
}

export interface HostProfile {
  id: string;
  full_name: string;
  profile_image_url: string;
  is_super_host: boolean;
  host_about?: string;
  host_review_count: number;
  host_rating_average: number;
  created_at: string;
}

export interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: {
    accuracy: number;
    cleanliness: number;
    communication: number;
    location: number;
    value: number;
    checking: number;
  };
  recent_reviews: ReviewItem[];
}

export interface AvailabilityCalendar {
  available_dates: string[];
  blocked_dates: string[];
  price_calendar: PriceCalendarEntry[];
}

export interface PriceCalendarEntry {
  date: string;
  price: number;
  is_available: boolean;
}

export interface AuctionInfo {
  id: string;
  start_date: string;
  end_date: string;
  auction_start_time: string;
  auction_end_time: string;
  starting_price: number;
  current_highest_bid: number | null;
  minimum_bid: number;
  total_bids: number;
  status: string;
}

export interface PropertyResponse {
  id: string;
  title: string;
  description: string;
  property_type: string;
  category: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  location: {
    address_line1: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    latitude: number;
    longitude: number;
  };
  pricing: {
    base_price: number;
    cleaning_fee: number;
    service_fee: number;
  };
  policies: {
    cancellation_policy: string;
    instant_book: boolean;
    minimum_stay: number;
    check_in_time: string;
    check_out_time: string;
  };
  images: PropertyImage[];
  amenities: Amenity[];
  highlights: PropertyHighlight[];
  house_rules: HouseRule[];
  location_descriptions: LocationDescription[];
  host: HostProfile;
  reviews: ReviewSummary;
  availability_calendar: AvailabilityCalendar;
  active_auctions: AuctionInfo[];
}

export interface PropertyHighlight {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export interface HouseRule {
  id: string;
  rule_type: string;
  title: string;
  description: string;
}

export interface LocationDescription {
  id: string;
  description_type: string;
  title: string;
  description: string;
}

export interface HostProfile {
  id: string;
  full_name: string;
  profile_image_url: string;
  is_super_host: boolean;
  host_about?: string;
  host_review_count: number;
  host_rating_average: number;
  created_at: string;
}

export interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: {
    accuracy: number;
    cleanliness: number;
    communication: number;
    location: number;
    value: number;
    checking: number;
  };
  recent_reviews: ReviewItem[];
}

export interface ReviewItem {
  id: string;
  reviewer: {
    id: string;
    full_name: string;
    profile_image_url: string;
  };
  rating: number;
  review_text: string;
  created_at: string;
  response_text?: string;
}

export interface AvailabilityCalendar {
  available_dates: string[];
  blocked_dates: string[];
  price_calendar: PriceCalendar[];
}

export interface PriceCalendar {
  date: string;
  price: number;
  is_available: boolean;
}

export interface AuctionInfo {
  id: string;
  start_date: string;
  end_date: string;
  auction_start_time: string;
  auction_end_time: string;
  starting_price: number;
  current_highest_bid: number | null;
  minimum_bid: number;
  total_bids: number;
  status: string;
}

export interface Booking {
  id: string;
  propertyId: string;
  guestId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: number;
  name: string;
  property_id: string | null;
  guest_id: number;
  host_id: number;
  last_message_at: string | null;
  is_archived: boolean;
  has_unread: boolean;
  property_title?: string;
  other_user?: User;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message_text: string;
  sent_at: string;
  is_read: boolean;
  sender: User;
}

export interface Notification {
  id: string;
  type: string | null;
  user_id: string | null;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  is_pushed: boolean;
  created: string;
}

export interface Subscription {
  id: string;
  endpoint: string;
  device_id: string;
  active: boolean;
  timestamp: string;
}

export interface ReviewSummary {
  total_reviews: number;
  average_rating: number;
  rating_breakdown: {
    accuracy: number;
    cleanliness: number;
    communication: number;
    location: number;
    value: number;
    checking: number;
  };
  recent_reviews: ReviewItem[];
}
