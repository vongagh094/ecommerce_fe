// File: index.ts
export interface User {
  id: number;
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
  wishlist_id: number;
  property_id: number;
  added_at: string;
  property: {
    id: string;
    title: string;
    base_price: number;
  };
}

export interface Wishlist {
  id: number;
  user_id: number;
  name: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
  properties: WishlistProperty[];
  total_properties?: number; // Optional, as it may not always be returned
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
  id: string;
  title: string;
  images: PropertyImage[];
  base_price: number;
  location: {
    city: string;
    state: string;
    country: string;
  };
  rating: {
    average: number;
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
  location?: string;
  check_in?: string;
  check_out?: string;
  guests?: number;
  page?: number;
  limit?: number;
}

export interface FilterParams extends SearchParams {
  min_price?: number;
  max_price?: number;
  property_types?: string[];
  amenities?: string[];
  cancellation_policy?: string[];
  instant_book?: boolean;
  min_rating?: number;
  bedrooms?: number;
  bathrooms?: number;
  categories?: string[];
}

export interface SearchResponse {
  properties: PropertyCard[];
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
  id: string;
  name: string;
  category: string;
}

export interface PropertyDetails {
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
  host_about: string;
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
  current_highest_bid: number;
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

export interface Review {
  id: string;
  propertyId: string;
  guestId: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface Conversation {
  id: number;
  name: string;
  property_id: number | null;
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
  id: number;
  type: string | null;
  user_id: number | null;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  is_pushed: boolean;
  created: string;
}

export interface Subscription {
  id: number;
  endpoint: string;
  device_id: string;
  active: boolean;
  timestamp: string;
}