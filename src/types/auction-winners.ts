/**
 * Auction winner-related TypeScript interfaces and types
 * Used for managing auction results and winner interactions
 */

import { PropertyDetails } from './index'

export interface AuctionWinner {
  id: string
  auctionId: string
  userId: string
  bidId: string
  winType: 'FULL' | 'PARTIAL'
  awardedNights: string[]
  totalAmount: number
  status: WinnerStatus
  notifiedAt?: string
  respondedAt?: string
  paymentDeadline: string
}

export type WinnerStatus = 'NOTIFIED' | 'CONFIRMED' | 'DECLINED' | 'PAID' | 'EXPIRED'

export interface SecondChanceOffer {
  id: string
  originalBidId: string
  userId: string
  auctionId: string
  offeredNights: string[]
  amount: number
  responseDeadline: string
  status: 'WAITING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED'
}

export interface WinningBid {
  id: string
  auctionId: string
  property: PropertyDetails
  bidAmount: number
  checkIn: string
  checkOut: string
  isPartialWin: boolean
  awardedNights: AwardedNight[]
  status: 'PENDING_PAYMENT' | 'PAID' | 'EXPIRED'
  paymentDeadline: string
}

export interface AwardedNight {
  date: string
  pricePerNight: number
  isSelected: boolean
  rangeId: string // Groups consecutive nights
}

export interface PartialNight {
  date: string
  pricePerNight: number
  isAwarded: boolean
}

export interface AuctionDetails {
  id: string
  propertyId: string
  startDate: string
  endDate: string
  startingPrice: number
  currentHighestBid: number
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  objective: 'HIGHEST_TOTAL' | 'HIGHEST_PER_NIGHT' | 'HYBRID'
}

export interface BidDetails {
  id: string
  auctionId: string
  userId: string
  checkIn: string
  checkOut: string
  totalAmount: number
  pricePerNight: number
  allowPartial: boolean
  status: 'ACTIVE' | 'WITHDRAWN' | 'EXPIRED'
}

// WebSocket message types for real-time communication
export interface AuctionResultMessage {
  type: 'AUCTION_RESULT'
  auctionId: string
  userId: string
  result: 'FULL_WIN' | 'PARTIAL_WIN' | 'LOST'
  awardedNights?: string[]
  amount: number
  paymentDeadline: string
  propertyName: string
}

export interface SecondChanceMessage {
  type: 'SECOND_CHANCE_OFFER'
  offerId: string
  auctionId: string
  userId: string
  offeredNights: string[]
  amount: number
  responseDeadline: string
  propertyName: string
}

export interface PaymentStatusMessage {
  type: 'PAYMENT_STATUS'
  paymentId: string
  userId: string
  status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  transactionId?: string
}

export interface BookingConfirmationMessage {
  type: 'BOOKING_CONFIRMED'
  bookingId: string
  userId: string
  propertyName: string
  checkIn: string
  checkOut: string
}

export type PaymentNotificationMessage = 
  | AuctionResultMessage 
  | SecondChanceMessage 
  | PaymentStatusMessage 
  | BookingConfirmationMessage