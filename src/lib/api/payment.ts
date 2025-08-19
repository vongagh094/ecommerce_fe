/**
 * ZaloPay Payment API Integration
 * Handles payment creation, verification, and callback processing
 */

import { apiClient } from './base'
import { PaymentSession, PaymentStatus, PaymentError, BookingDetails } from '@/types/payment'

export class PaymentErrorHandler {
  static handlePaymentError(error: any): { type: string, message: string } {
    if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED' || error.code === 'AUTH_TOKEN_ERROR') {
      return { type: 'AUTH_ERROR', message: 'Authentication required. Please log in again.' }
    }
    if (error.code === 'PAYMENT_CREATION_FAILED') {
      return { type: 'RETRY', message: 'Unable to create payment. Please try again.' }
    }
    if (error.code === 'PAYMENT_CANCELLED') {
      return { type: 'RETURN_TO_SELECTION', message: 'Payment was cancelled.' }
    }
    if (error.code === 'PAYMENT_TIMEOUT') {
      return { type: 'VERIFY_STATUS', message: 'Payment is taking longer than expected.' }
    }
    if (error.code === 'INSUFFICIENT_FUNDS') {
      return { type: 'SHOW_ERROR', message: 'Insufficient funds. Please try a different payment method.' }
    }
    return { type: 'SHOW_ERROR', message: 'An unexpected error occurred. Please contact support.' }
  }
}

export const paymentUtils = {
  // Format amount for display
  formatAmount: (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount)
  },

  // Validate payment amount
  validatePaymentAmount: (amount: number): boolean => {
    return amount > 0 && amount <= 100000000 // Max 100M VND
  },

  // Generate order info for ZaloPay
  generateOrderInfo: (propertyName: string, checkIn: string, checkOut: string): string => {
    const checkInDate = new Date(checkIn).toLocaleDateString()
    const checkOutDate = new Date(checkOut).toLocaleDateString()
    return `Booking for ${propertyName} (${checkInDate} - ${checkOutDate})`
  },

  // Parse app transaction ID from URL (supports both apptransid and appTransId)
  parseAppTransIdFromUrl: (): string | null => {
    if (typeof window === 'undefined') return null
    
    const urlParams = new URLSearchParams(window.location.search)
    const lower = urlParams.get('apptransid')
    const camel = urlParams.get('appTransId')
    return lower || camel
  },

  // Generate payment reference number
  generateReferenceNumber: (): string => {
    const timestamp = Date.now().toString()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `PAY${timestamp}${random}`
  },

  // Save payment return URL
  savePaymentReturnUrl: (): void => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      localStorage.setItem('payment_return_url', currentUrl)
    }
  },

  // Get payment return URL
  getPaymentReturnUrl: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('payment_return_url') || '/'
    }
    return '/'
  },

  // Handle authentication error
  handleAuthError: (): void => {
    if (typeof window !== 'undefined') {
      // Save current URL for return after login
      localStorage.setItem('auth_return_url', window.location.href)
    }
  }
}

export const paymentApi = {
  // Create ZaloPay payment order
  createPayment: async (paymentData: {
    auctionId: string
    selectedNights: string[]
    amount: number
    orderInfo: string
    redirectParams: string
  }): Promise<{
    orderUrl: string
    appTransId: string
    amount: number
  }> => {
    try {
      return await apiClient.post('/payment/zalopay/create', paymentData, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Verify payment status
  verifyPayment: async (appTransId: string): Promise<{
    status: PaymentStatus
    transactionId?: string
    amount?: number
    paidAt?: string
  }> => {
    try {
      return await apiClient.get(`/payment/zalopay/status/${appTransId}`, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Handle payment callback
  handleCallback: async (callbackData: any): Promise<void> => {
    try {
      return await apiClient.post('/payment/zalopay/callback', callbackData, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Get payment session by ID
  getPaymentSession: async (sessionId: string): Promise<PaymentSession> => {
    try {
      return await apiClient.get(`/payment/sessions/${sessionId}`, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Get payment by transaction ID
  getPaymentByTransactionId: async (transactionId: string): Promise<PaymentSession> => {
    try {
      return await apiClient.get(`/payment/transactions/${transactionId}`, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Create booking after successful payment
  createBooking: async (paymentId: string): Promise<{
    id: string
    referenceNumber: string
    propertyId: string
    propertyName: string
    hostId: string
    checkIn: string
    checkOut: string
    guestCount: number
    totalAmount: number
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
    createdAt: string
  }> => {
    try {
      return await apiClient.post(`/payment/${paymentId}/booking`, {}, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Get booking by payment ID
  getBookingByPaymentId: async (paymentId: string): Promise<{
    id: string
    referenceNumber: string
    propertyId: string
    propertyName: string
    hostId: string
    checkIn: string
    checkOut: string
    guestCount: number
    totalAmount: number
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
    createdAt: string
  }> => {
    try {
      return await apiClient.get(`/payment/${paymentId}/booking`, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Update calendar availability after booking
  updateCalendarAvailability: async (bookingId: string): Promise<void> => {
    try {
      return await apiClient.post(`/bookings/${bookingId}/update-calendar`, {}, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Create conversation thread with host
  createConversationThread: async (bookingId: string): Promise<{
    threadId: string
  }> => {
    try {
      return await apiClient.post(`/bookings/${bookingId}/conversation`, {}, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  },

  // Send booking confirmation email
  sendBookingConfirmationEmail: async (bookingId: string): Promise<void> => {
    try {
      return await apiClient.post(`/bookings/${bookingId}/send-confirmation`, {}, { requireAuth: true })
    } catch (error: any) {
      // Handle authentication errors specially
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED') {
        paymentUtils.handleAuthError()
      }
      throw error
    }
  }
}