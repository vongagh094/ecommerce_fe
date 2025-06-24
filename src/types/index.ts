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

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  isRead: boolean
  createdAt: Date
}

export interface Review {
  id: string
  propertyId: string
  guestId: string
  rating: number
  comment: string
  createdAt: Date
}
