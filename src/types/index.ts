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