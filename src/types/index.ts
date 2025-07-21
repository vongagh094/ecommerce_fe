export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  role: "traveller" | "host" | "admin"
  createdAt: Date
  updatedAt: Date
}

export interface Property {
  id: string
  title: string
  description: string
  price: number
  location: string
  images: string[]
  amenities: string[]
  hostId: string
  rating: number
  reviewCount: number
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Booking {
  id: string
  propertyId: string
  guestId: string
  checkIn: Date
  checkOut: Date
  guests: number
  totalPrice: number
  status: "pending" | "confirmed" | "cancelled" | "completed"
  createdAt: Date
  updatedAt: Date
}

export interface Review {
  id: string
  propertyId: string
  guestId: string
  rating: number
  comment: string
  createdAt: Date
}

export interface Conversation {
  id: number;
  property_id: number | null;
  guest_id: number;
  host_id: number;
  last_message_at: string | null;
  is_archived: boolean;
  property_title?: string;
  other_user: User;
  has_unread: boolean;
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