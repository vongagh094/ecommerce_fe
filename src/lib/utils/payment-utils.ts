/**
 * Payment Utilities and Helpers
 * Comprehensive utilities for payment amount calculations, ZaloPay integration,
 * session management, and error handling
 */

import { PaymentError, PaymentSession, PaymentStatus } from '@/types/payment'
import { AwardedNight } from '@/types/auction-winners'

/**
 * Payment amount calculation utilities
 */
export class PaymentCalculator {
  /**
   * Calculate total amount for selected nights
   */
  static calculateTotalAmount(nights: Array<{ date: string; pricePerNight: number }>): number {
    if (!nights || nights.length === 0) {
      return 0
    }
    
    return nights.reduce((total, night) => {
      if (typeof night.pricePerNight !== 'number' || night.pricePerNight < 0) {
        throw new PaymentError(
          'INVALID_NIGHT_PRICE',
          `Invalid price for night ${night.date}: ${night.pricePerNight}`
        )
      }
      return total + night.pricePerNight
    }, 0)
  }

  /**
   * Calculate total amount for awarded nights with selection
   */
  static calculateSelectedNightsAmount(awardedNights: AwardedNight[]): number {
    const selectedNights = awardedNights.filter(night => night.isSelected)
    return this.calculateTotalAmount(selectedNights.map(night => ({
      date: night.date,
      pricePerNight: night.pricePerNight
    })))
  }

  /**
   * Calculate amount with tax and fees
   */
  static calculateAmountWithFees(baseAmount: number, taxRate: number = 0.1, serviceFee: number = 0): number {
    if (baseAmount < 0) {
      throw new PaymentError('INVALID_AMOUNT', 'Base amount cannot be negative')
    }
    
    const taxAmount = Math.round(baseAmount * taxRate)
    const totalAmount = baseAmount + taxAmount + serviceFee
    
    return totalAmount
  }

  /**
   * Calculate discount amount
   */
  static calculateDiscountAmount(originalAmount: number, discountPercent: number): number {
    if (discountPercent < 0 || discountPercent > 100) {
      throw new PaymentError('INVALID_DISCOUNT', 'Discount percent must be between 0 and 100')
    }
    
    return Math.round(originalAmount * (discountPercent / 100))
  }

  /**
   * Calculate final amount after discount
   */
  static calculateFinalAmount(originalAmount: number, discountAmount: number): number {
    const finalAmount = originalAmount - discountAmount
    return Math.max(0, finalAmount) // Ensure non-negative
  }

  /**
   * Validate payment amount against limits
   */
  static validateAmount(amount: number): { isValid: boolean; error?: string } {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { isValid: false, error: 'Amount must be a valid number' }
    }
    
    if (amount <= 0) {
      return { isValid: false, error: 'Amount must be greater than 0' }
    }
    
    if (amount > 50000000) { // 50M VND limit
      return { isValid: false, error: 'Amount exceeds maximum limit of 50,000,000 VND' }
    }
    
    if (amount < 1000) { // Minimum 1,000 VND
      return { isValid: false, error: 'Amount must be at least 1,000 VND' }
    }
    
    return { isValid: true }
  }

  /**
   * Format amount for display (Vietnamese currency)
   */
  static formatAmount(amount: number, locale: string = 'vi-VN'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Format amount without currency symbol
   */
  static formatAmountPlain(amount: number, locale: string = 'vi-VN'): string {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  /**
   * Calculate payment breakdown
   */
  static calculatePaymentBreakdown(
    baseAmount: number,
    options: {
      taxRate?: number
      serviceFee?: number
      discountPercent?: number
      discountAmount?: number
    } = {}
  ): {
    baseAmount: number
    taxAmount: number
    serviceFee: number
    discountAmount: number
    totalAmount: number
  } {
    const {
      taxRate = 0.1,
      serviceFee = 0,
      discountPercent = 0,
      discountAmount = 0
    } = options

    const taxAmount = Math.round(baseAmount * taxRate)
    const calculatedDiscountAmount = discountAmount || this.calculateDiscountAmount(baseAmount, discountPercent)
    const totalAmount = Math.max(0, baseAmount + taxAmount + serviceFee - calculatedDiscountAmount)

    return {
      baseAmount,
      taxAmount,
      serviceFee,
      discountAmount: calculatedDiscountAmount,
      totalAmount
    }
  }
}

/**
 * ZaloPay URL generation and validation utilities
 */
export class ZaloPayUrlUtils {
  private static readonly ZALOPAY_SANDBOX_URL = 'https://sb-openapi.zalopay.vn/v2'
  private static readonly ZALOPAY_PRODUCTION_URL = 'https://openapi.zalopay.vn/v2'

  /**
   * Get ZaloPay API base URL based on environment
   */
  static getApiBaseUrl(isProduction: boolean = false): string {
    return isProduction ? this.ZALOPAY_PRODUCTION_URL : this.ZALOPAY_SANDBOX_URL
  }

  /**
   * Generate ZaloPay order URL
   */
  static generateOrderUrl(orderToken: string, isProduction: boolean = false): string {
    const baseUrl = isProduction 
      ? 'https://zalopay.vn/order' 
      : 'https://sb-zalopay.vn/order'
    
    return `${baseUrl}/${orderToken}`
  }

  /**
   * Generate callback URL for ZaloPay
   */
  static generateCallbackUrl(baseUrl: string, sessionId: string): string {
    // Remove trailing slash if present
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    return `${cleanBaseUrl}/api/v1/payment/zalopay/callback/${sessionId}`
  }

  /**
   * Generate redirect URL for after payment
   */
  static generateRedirectUrl(baseUrl: string, sessionId: string, success: boolean = true): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    const status = success ? 'success' : 'cancel'
    return `${cleanBaseUrl}/dashboard/payment/confirmation?session=${sessionId}&status=${status}`
  }

  /**
   * Validate ZaloPay order URL
   */
  static validateOrderUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url)
      
      // Check if it's a valid ZaloPay domain
      const validDomains = ['zalopay.vn', 'sb-zalopay.vn']
      const isValidDomain = validDomains.some(domain => urlObj.hostname.includes(domain))
      
      if (!isValidDomain) {
        return { isValid: false, error: 'Invalid ZaloPay domain' }
      }
      
      // Check if URL has order path
      if (!urlObj.pathname.includes('/order/')) {
        return { isValid: false, error: 'Invalid ZaloPay order URL format' }
      }
      
      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' }
    }
  }

  /**
   * Extract order token from ZaloPay URL
   */
  static extractOrderToken(url: string): string | null {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const orderIndex = pathParts.indexOf('order')
      
      if (orderIndex !== -1 && orderIndex < pathParts.length - 1) {
        return pathParts[orderIndex + 1]
      }
      
      return null
    } catch (error) {
      return null
    }
  }

  /**
   * Generate app_trans_id for ZaloPay
   */
  static generateAppTransId(appId: string, prefix: string = 'AUCTION'): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    return `${appId}_${prefix}_${timestamp}_${random}`
  }

  /**
   * Validate app_trans_id format
   */
  static validateAppTransId(appTransId: string): { isValid: boolean; error?: string } {
    if (!appTransId || typeof appTransId !== 'string') {
      return { isValid: false, error: 'App transaction ID is required' }
    }
    
    // ZaloPay app_trans_id format: appid_prefix_timestamp_random
    const parts = appTransId.split('_')
    if (parts.length < 4) {
      return { isValid: false, error: 'Invalid app transaction ID format' }
    }
    
    // Check if timestamp is valid
    const timestampIndex = parts.length - 2
    const timestamp = parseInt(parts[timestampIndex])
    if (isNaN(timestamp) || timestamp <= 0) {
      return { isValid: false, error: 'Invalid timestamp in app transaction ID' }
    }
    
    return { isValid: true }
  }

  /**
   * Parse app_trans_id components
   */
  static parseAppTransId(appTransId: string): {
    appId: string
    prefix: string
    timestamp: number
    random: string
  } | null {
    const validation = this.validateAppTransId(appTransId)
    if (!validation.isValid) {
      return null
    }
    
    const parts = appTransId.split('_')
    const appId = parts[0]
    const prefix = parts.slice(1, -2).join('_')
    const timestamp = parseInt(parts[parts.length - 2])
    const random = parts[parts.length - 1]
    
    return { appId, prefix, timestamp, random }
  }
}

/**
 * Payment session management utilities
 */
export class PaymentSessionManager {
  private static readonly SESSION_TIMEOUT_MINUTES = 15
  private static readonly CLEANUP_INTERVAL_MINUTES = 5

  /**
   * Create a new payment session
   */
  static createSession(
    auctionId: string,
    userId: string,
    amount: number,
    appTransId: string
  ): PaymentSession {
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.SESSION_TIMEOUT_MINUTES * 60 * 1000)
    
    return {
      id: this.generateSessionId(),
      auctionId,
      userId,
      amount,
      currency: 'VND',
      status: 'CREATED',
      appTransId,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    }
  }

  /**
   * Generate unique session ID
   */
  static generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }

  /**
   * Check if session is expired
   */
  static isSessionExpired(session: PaymentSession): boolean {
    return new Date() > new Date(session.expiresAt)
  }

  /**
   * Check if session is valid for payment
   */
  static isSessionValidForPayment(session: PaymentSession): { isValid: boolean; error?: string } {
    if (this.isSessionExpired(session)) {
      return { isValid: false, error: 'Payment session has expired' }
    }
    
    if (session.status === 'PAID') {
      return { isValid: false, error: 'Payment has already been completed' }
    }
    
    if (session.status === 'CANCELLED') {
      return { isValid: false, error: 'Payment session has been cancelled' }
    }
    
    if (session.status === 'FAILED') {
      return { isValid: false, error: 'Payment session has failed' }
    }
    
    return { isValid: true }
  }

  /**
   * Update session status
   */
  static updateSessionStatus(session: PaymentSession, status: PaymentStatus): PaymentSession {
    return {
      ...session,
      status
    }
  }

  /**
   * Calculate remaining time for session
   */
  static getRemainingTime(session: PaymentSession): number {
    const now = new Date().getTime()
    const expiresAt = new Date(session.expiresAt).getTime()
    return Math.max(0, expiresAt - now)
  }

  /**
   * Format remaining time for display
   */
  static formatRemainingTime(session: PaymentSession): string {
    const remainingMs = this.getRemainingTime(session)
    
    if (remainingMs <= 0) {
      return 'Expired'
    }
    
    const minutes = Math.floor(remainingMs / (1000 * 60))
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000)
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  /**
   * Check if session needs cleanup
   */
  static needsCleanup(session: PaymentSession): boolean {
    const cleanupTime = new Date(session.expiresAt).getTime() + (this.CLEANUP_INTERVAL_MINUTES * 60 * 1000)
    return new Date().getTime() > cleanupTime
  }

  /**
   * Get session status display text
   */
  static getStatusDisplayText(status: PaymentStatus): string {
    switch (status) {
      case 'CREATED':
        return 'Payment created'
      case 'PENDING':
        return 'Processing payment...'
      case 'PAID':
        return 'Payment successful'
      case 'FAILED':
        return 'Payment failed'
      case 'CANCELLED':
        return 'Payment cancelled'
      case 'EXPIRED':
        return 'Payment expired'
      default:
        return 'Unknown status'
    }
  }

  /**
   * Get session status color for UI
   */
  static getStatusColor(status: PaymentStatus): string {
    switch (status) {
      case 'CREATED':
        return 'blue'
      case 'PENDING':
        return 'yellow'
      case 'PAID':
        return 'green'
      case 'FAILED':
        return 'red'
      case 'CANCELLED':
        return 'gray'
      case 'EXPIRED':
        return 'orange'
      default:
        return 'gray'
    }
  }
}

/**
 * Payment error classification and recovery utilities
 */
export class PaymentErrorClassifier {
  /**
   * Classify payment error by type
   */
  static classifyError(error: any): {
    category: 'NETWORK' | 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'USER' | 'UNKNOWN'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    isRetryable: boolean
    userMessage: string
    technicalMessage: string
  } {
    if (error instanceof PaymentError) {
      return this.classifyPaymentError(error)
    }
    
    // Handle API errors
    if (error?.status) {
      return this.classifyHttpError(error)
    }
    
    // Handle network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return {
        category: 'NETWORK',
        severity: 'MEDIUM',
        isRetryable: true,
        userMessage: 'Network connection issue. Please check your internet and try again.',
        technicalMessage: `Network error: ${error.message}`
      }
    }
    
    // Unknown error
    return {
      category: 'UNKNOWN',
      severity: 'HIGH',
      isRetryable: false,
      userMessage: 'An unexpected error occurred. Please contact support.',
      technicalMessage: `Unknown error: ${error?.message || 'No error message'}`
    }
  }

  /**
   * Classify PaymentError instances
   */
  private static classifyPaymentError(error: PaymentError): {
    category: 'NETWORK' | 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'USER' | 'UNKNOWN'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    isRetryable: boolean
    userMessage: string
    technicalMessage: string
  } {
    switch (error.code) {
      // Validation errors
      case 'INVALID_PAYMENT_DATA':
      case 'INVALID_TRANSACTION_ID':
      case 'INVALID_SESSION_ID':
      case 'INVALID_AMOUNT':
      case 'INVALID_NIGHT_PRICE':
      case 'INVALID_DISCOUNT':
        return {
          category: 'VALIDATION',
          severity: 'LOW',
          isRetryable: false,
          userMessage: 'Please check your payment information and try again.',
          technicalMessage: error.message
        }

      // Business logic errors
      case 'AMOUNT_TOO_HIGH':
      case 'INSUFFICIENT_FUNDS':
      case 'PAYMENT_EXPIRED':
        return {
          category: 'BUSINESS',
          severity: 'MEDIUM',
          isRetryable: false,
          userMessage: error.message,
          technicalMessage: error.message
        }

      // User action errors
      case 'PAYMENT_CANCELLED':
        return {
          category: 'USER',
          severity: 'LOW',
          isRetryable: true,
          userMessage: 'Payment was cancelled. You can try again.',
          technicalMessage: error.message
        }

      // Network/System errors
      case 'PAYMENT_CREATION_FAILED':
      case 'PAYMENT_VERIFICATION_FAILED':
      case 'CALLBACK_PROCESSING_FAILED':
      case 'SESSION_FETCH_FAILED':
      case 'SESSIONS_FETCH_FAILED':
        return {
          category: 'SYSTEM',
          severity: 'MEDIUM',
          isRetryable: true,
          userMessage: 'Service temporarily unavailable. Please try again.',
          technicalMessage: error.message
        }

      // Timeout errors
      case 'PAYMENT_TIMEOUT':
      case 'PAYMENT_VERIFICATION_TIMEOUT':
        return {
          category: 'SYSTEM',
          severity: 'MEDIUM',
          isRetryable: true,
          userMessage: 'Payment is taking longer than expected. We\'re still checking...',
          technicalMessage: error.message
        }

      // Critical errors
      case 'PAYMENT_CANCELLATION_FAILED':
        return {
          category: 'SYSTEM',
          severity: 'CRITICAL',
          isRetryable: false,
          userMessage: 'Unable to cancel payment. Please contact support immediately.',
          technicalMessage: error.message
        }

      default:
        return {
          category: 'UNKNOWN',
          severity: 'HIGH',
          isRetryable: false,
          userMessage: 'An unexpected error occurred. Please contact support.',
          technicalMessage: error.message
        }
    }
  }

  /**
   * Classify HTTP errors
   */
  private static classifyHttpError(error: any): {
    category: 'NETWORK' | 'VALIDATION' | 'BUSINESS' | 'SYSTEM' | 'USER' | 'UNKNOWN'
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    isRetryable: boolean
    userMessage: string
    technicalMessage: string
  } {
    const status = error.status

    if (status >= 400 && status < 500) {
      // Client errors
      if (status === 401) {
        return {
          category: 'USER',
          severity: 'MEDIUM',
          isRetryable: false,
          userMessage: 'Please log in again to continue.',
          technicalMessage: 'Authentication required'
        }
      }
      
      if (status === 403) {
        return {
          category: 'USER',
          severity: 'MEDIUM',
          isRetryable: false,
          userMessage: 'You don\'t have permission to perform this action.',
          technicalMessage: 'Access forbidden'
        }
      }
      
      if (status === 429) {
        return {
          category: 'SYSTEM',
          severity: 'LOW',
          isRetryable: true,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          technicalMessage: 'Rate limit exceeded'
        }
      }
      
      return {
        category: 'VALIDATION',
        severity: 'LOW',
        isRetryable: false,
        userMessage: 'Please check your information and try again.',
        technicalMessage: `Client error: ${status}`
      }
    }
    
    if (status >= 500) {
      // Server errors
      return {
        category: 'SYSTEM',
        severity: 'HIGH',
        isRetryable: true,
        userMessage: 'Server error. Please try again in a moment.',
        technicalMessage: `Server error: ${status}`
      }
    }
    
    return {
      category: 'UNKNOWN',
      severity: 'MEDIUM',
      isRetryable: true,
      userMessage: 'An unexpected error occurred. Please try again.',
      technicalMessage: `HTTP error: ${status}`
    }
  }

  /**
   * Get recovery strategy for error
   */
  static getRecoveryStrategy(error: any): {
    action: 'RETRY' | 'RETRY_WITH_DELAY' | 'REDIRECT' | 'SHOW_ERROR' | 'CONTACT_SUPPORT'
    delay?: number
    maxRetries?: number
    redirectUrl?: string
  } {
    const classification = this.classifyError(error)
    
    if (!classification.isRetryable) {
      if (classification.severity === 'CRITICAL') {
        return { action: 'CONTACT_SUPPORT' }
      }
      return { action: 'SHOW_ERROR' }
    }
    
    // Retryable errors
    switch (classification.category) {
      case 'NETWORK':
        return {
          action: 'RETRY_WITH_DELAY',
          delay: 2000,
          maxRetries: 3
        }
      
      case 'SYSTEM':
        if (classification.severity === 'HIGH') {
          return {
            action: 'RETRY_WITH_DELAY',
            delay: 5000,
            maxRetries: 2
          }
        }
        return {
          action: 'RETRY_WITH_DELAY',
          delay: 1000,
          maxRetries: 3
        }
      
      case 'USER':
        return { action: 'RETRY' }
      
      default:
        return {
          action: 'RETRY_WITH_DELAY',
          delay: 1000,
          maxRetries: 2
        }
    }
  }

  /**
   * Check if error should be logged
   */
  static shouldLogError(error: any): boolean {
    const classification = this.classifyError(error)
    
    // Always log critical and high severity errors
    if (classification.severity === 'CRITICAL' || classification.severity === 'HIGH') {
      return true
    }
    
    // Log system and unknown errors
    if (classification.category === 'SYSTEM' || classification.category === 'UNKNOWN') {
      return true
    }
    
    // Don't log user actions and low-severity validation errors
    return false
  }

  /**
   * Get error metrics tags
   */
  static getErrorTags(error: any): Record<string, string> {
    const classification = this.classifyError(error)
    
    return {
      error_category: classification.category,
      error_severity: classification.severity,
      is_retryable: classification.isRetryable.toString(),
      error_code: error instanceof PaymentError ? error.code : 'UNKNOWN'
    }
  }
}

/**
 * Payment retry utilities
 */
export class PaymentRetryManager {
  private static readonly DEFAULT_MAX_RETRIES = 3
  private static readonly DEFAULT_BASE_DELAY = 1000

  /**
   * Execute operation with retry logic
   */
  static async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number
      baseDelay?: number
      maxDelay?: number
      backoffMultiplier?: number
      shouldRetry?: (error: any, attempt: number) => boolean
    } = {}
  ): Promise<T> {
    const {
      maxRetries = this.DEFAULT_MAX_RETRIES,
      baseDelay = this.DEFAULT_BASE_DELAY,
      maxDelay = 30000,
      backoffMultiplier = 2,
      shouldRetry = (error: any) => PaymentErrorClassifier.classifyError(error).isRetryable
    } = options

    let lastError: any

    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error
        
        // Don't retry on the last attempt or if error shouldn't be retried
        if (attempt > maxRetries || !shouldRetry(error, attempt)) {
          throw error
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
          baseDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay
        )

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  /**
   * Create retry configuration based on error type
   */
  static getRetryConfig(error: any): {
    maxRetries: number
    baseDelay: number
    maxDelay: number
    backoffMultiplier: number
  } {
    const classification = PaymentErrorClassifier.classifyError(error)
    
    switch (classification.category) {
      case 'NETWORK':
        return {
          maxRetries: 3,
          baseDelay: 2000,
          maxDelay: 10000,
          backoffMultiplier: 2
        }
      
      case 'SYSTEM':
        if (classification.severity === 'HIGH') {
          return {
            maxRetries: 2,
            baseDelay: 5000,
            maxDelay: 15000,
            backoffMultiplier: 2
          }
        }
        return {
          maxRetries: 3,
          baseDelay: 1000,
          maxDelay: 8000,
          backoffMultiplier: 2
        }
      
      default:
        return {
          maxRetries: 1,
          baseDelay: 1000,
          maxDelay: 5000,
          backoffMultiplier: 1.5
        }
    }
  }
}