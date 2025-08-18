/**
 * Payment-related TypeScript interfaces and types
 * Used for ZaloPay integration and payment processing
 */

export interface PaymentSession {
  id: string
  auctionId: string
  userId: string
  amount: number
  currency: 'VND'
  status: PaymentStatus
  appTransId: string
  orderUrl?: string
  createdAt: string
  expiresAt: string
}

export type PaymentStatus = 'CREATED' | 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED'

export interface PaymentErrorData {
  code: string
  message: string
  details?: any
}

export class PaymentError extends Error {
  public code: string
  public details?: any

  constructor(code: string, message: string, details?: any) {
    super(message)
    this.name = 'PaymentError'
    this.code = code
    this.details = details
  }
}

export interface ZaloPayConfig {
  appId: string
  key1: string
  key2: string
  endpoint: string
  callbackUrl: string
  redirectUrl: string
}

export interface CreatePaymentRequest {
  auctionId: string
  selectedNights: string[]
  amount: number
  orderInfo: string
}

export interface CreatePaymentResponse {
  orderUrl: string
  appTransId: string
  amount: number
}

export interface PaymentStatusResponse {
  status: 'PAID' | 'PENDING' | 'FAILED' | 'CANCELLED'
  transactionId?: string
  amount?: number
  paidAt?: string
}

export interface PaymentCallbackData {
  data: string
  mac: string
}

export interface ZaloPayCallbackResponse {
  return_code: number
  return_message: string
}

export interface PaymentVerificationResult {
  isValid: boolean
  status: PaymentStatus
  transactionId?: string
  amount?: number
  paidAt?: string
  error?: string
}

export interface BookingDetails {
  auctionId: string
  propertyId: string
  propertyName: string
  checkIn: string
  checkOut: string
  selectedNights: string[]
  guestCount: number
}

export interface PaymentNotification {
  id: string
  type: 'WINNER' | 'SECOND_CHANCE' | 'PAYMENT_STATUS' | 'BOOKING_CONFIRMED'
  title: string
  message: string
  amount?: number
  actionRequired: boolean
  expiresAt?: string
  timestamp: string
}

export interface PaymentErrorAction {
  type: 'RETRY' | 'RETURN_TO_SELECTION' | 'VERIFY_STATUS' | 'SHOW_ERROR'
  message: string
}