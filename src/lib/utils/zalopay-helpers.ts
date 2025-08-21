/**
 * ZaloPay Integration Helpers
 * Utilities for ZaloPay URL generation, validation, and integration
 */

import { PaymentError } from '@/types/payment'
import * as crypto from 'crypto'

/**
 * ZaloPay configuration interface
 */
export interface ZaloPayConfig {
  appId: string
  key1: string
  key2: string
  endpoint: string
  callbackUrl: string
  redirectUrl: string
}

/**
 * ZaloPay order creation data
 */
export interface ZaloPayOrderData {
  app_id: string
  app_trans_id: string
  app_user: string
  app_time: number
  amount: number
  item: string
  description: string
  embed_data: string
  bank_code: string
  callback_url: string
  redirect_url: string
  mac: string
}

/**
 * ZaloPay callback data structure
 */
export interface ZaloPayCallbackData {
  data: string
  mac: string
}

/**
 * ZaloPay order status response
 */
export interface ZaloPayStatusResponse {
  return_code: number
  return_message: string
  sub_return_code: number
  sub_return_message: string
  is_processing: boolean
  amount: number
  zp_trans_id: number
}

/**
 * ZaloPay integration utilities
 */
export class ZaloPayHelper {
  private config: ZaloPayConfig

  constructor(config: ZaloPayConfig) {
    this.config = config
  }

  /**
   * Generate ZaloPay order data
   */
  generateOrderData(params: {
    appTransId: string
    userId: string
    amount: number
    description: string
    propertyName: string
    checkIn: string
    checkOut: string
  }): ZaloPayOrderData {
    const { appTransId, userId, amount, description, propertyName, checkIn, checkOut } = params

    // Validate inputs
    if (!appTransId || !userId || !amount || amount <= 0) {
      throw new PaymentError(
        'INVALID_ORDER_DATA',
        'Invalid order data provided'
      )
    }

    const appTime = Date.now()
    
    // Create embed data with booking details
    const embedData = JSON.stringify({
      userId,
      propertyName,
      checkIn,
      checkOut,
      redirectUrl: this.config.redirectUrl
    })

    // Create order data
    const orderData: Omit<ZaloPayOrderData, 'mac'> = {
      app_id: this.config.appId,
      app_trans_id: appTransId,
      app_user: userId,
      app_time: appTime,
      amount,
      item: JSON.stringify([{
        name: propertyName,
        quantity: 1,
        price: amount
      }]),
      description,
      embed_data: embedData,
      bank_code: '', // Empty for all banks
      callback_url: this.config.callbackUrl,
      redirect_url: this.config.redirectUrl
    }

    // Generate MAC
    const mac = this.generateOrderMac(orderData)

    return {
      ...orderData,
      mac
    }
  }

  /**
   * Generate MAC for order data
   */
  private generateOrderMac(orderData: Omit<ZaloPayOrderData, 'mac'>): string {
    const data = `${orderData.app_id}|${orderData.app_trans_id}|${orderData.app_user}|${orderData.amount}|${orderData.app_time}|${orderData.embed_data}|${orderData.item}`
    
    return crypto
      .createHmac('sha256', this.config.key1)
      .update(data)
      .digest('hex')
  }

  /**
   * Verify callback MAC
   */
  verifyCallbackMac(callbackData: ZaloPayCallbackData): boolean {
    try {
      const expectedMac = crypto
        .createHmac('sha256', this.config.key2)
        .update(callbackData.data)
        .digest('hex')

      return expectedMac === callbackData.mac
    } catch (error) {
      return false
    }
  }

  /**
   * Parse callback data
   */
  parseCallbackData(callbackData: string): any {
    try {
      return JSON.parse(callbackData)
    } catch (error) {
      throw new PaymentError(
        'INVALID_CALLBACK_DATA',
        'Failed to parse ZaloPay callback data'
      )
    }
  }

  /**
   * Generate status query MAC
   */
  generateStatusQueryMac(appTransId: string): string {
    const data = `${this.config.appId}|${appTransId}|${this.config.key1}`
    
    return crypto
      .createHmac('sha256', this.config.key1)
      .update(data)
      .digest('hex')
  }

  /**
   * Create status query data
   */
  createStatusQueryData(appTransId: string): {
    app_id: string
    app_trans_id: string
    mac: string
  } {
    return {
      app_id: this.config.appId,
      app_trans_id: appTransId,
      mac: this.generateStatusQueryMac(appTransId)
    }
  }

  /**
   * Validate ZaloPay response
   */
  validateResponse(response: ZaloPayStatusResponse): {
    isValid: boolean
    isPaid: boolean
    isProcessing: boolean
    error?: string
  } {
    // Check return code
    if (response.return_code !== 1 && response.return_code !== 2) {
      return {
        isValid: false,
        isPaid: false,
        isProcessing: false,
        error: response.return_message || 'Invalid response from ZaloPay'
      }
    }

    // Return code 1 = success (paid)
    if (response.return_code === 1) {
      return {
        isValid: true,
        isPaid: true,
        isProcessing: false
      }
    }

    // Return code 2 = processing
    if (response.return_code === 2) {
      return {
        isValid: true,
        isPaid: false,
        isProcessing: response.is_processing || false
      }
    }

    return {
      isValid: false,
      isPaid: false,
      isProcessing: false,
      error: 'Unknown response status'
    }
  }

  /**
   * Generate app_trans_id
   */
  static generateAppTransId(appId: string, prefix: string = 'AUCTION'): string {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
    return `${appId}_${prefix}_${timestamp}_${random}`
  }

  /**
   * Validate app_trans_id format
   */
  static validateAppTransId(appTransId: string): boolean {
    if (!appTransId || typeof appTransId !== 'string') {
      return false
    }

    // Format: appid_prefix_timestamp_random
    const parts = appTransId.split('_')
    if (parts.length < 4) {
      return false
    }

    // Check timestamp
    const timestampIndex = parts.length - 2
    const timestamp = parseInt(parts[timestampIndex])
    if (isNaN(timestamp) || timestamp <= 0) {
      return false
    }

    return true
  }

  /**
   * Extract timestamp from app_trans_id
   */
  static extractTimestamp(appTransId: string): number | null {
    if (!this.validateAppTransId(appTransId)) {
      return null
    }

    const parts = appTransId.split('_')
    const timestampIndex = parts.length - 2
    return parseInt(parts[timestampIndex])
  }

  /**
   * Check if app_trans_id is expired (older than 15 minutes)
   */
  static isAppTransIdExpired(appTransId: string, timeoutMinutes: number = 15): boolean {
    const timestamp = this.extractTimestamp(appTransId)
    if (!timestamp) {
      return true
    }

    const now = Date.now()
    const timeoutMs = timeoutMinutes * 60 * 1000
    return (now - timestamp) > timeoutMs
  }

  /**
   * Format amount for ZaloPay (must be integer)
   */
  static formatAmount(amount: number): number {
    if (typeof amount !== 'number' || isNaN(amount)) {
      throw new PaymentError('INVALID_AMOUNT', 'Amount must be a valid number')
    }

    // ZaloPay requires integer amounts
    return Math.round(amount)
  }

  /**
   * Validate amount for ZaloPay
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

    // Check if amount is integer (ZaloPay requirement)
    if (amount !== Math.round(amount)) {
      return { isValid: false, error: 'Amount must be a whole number' }
    }

    return { isValid: true }
  }

  /**
   * Create order description
   */
  static createOrderDescription(
    propertyName: string,
    checkIn: string,
    checkOut: string,
    nights: number
  ): string {
    return `Booking payment for ${propertyName} (${nights} night${nights > 1 ? 's' : ''}) from ${checkIn} to ${checkOut}`
  }

  /**
   * Create order item data
   */
  static createOrderItem(
    propertyName: string,
    nights: number,
    pricePerNight: number
  ): string {
    return JSON.stringify([{
      name: `${propertyName} - ${nights} night${nights > 1 ? 's' : ''}`,
      quantity: nights,
      price: pricePerNight
    }])
  }

  /**
   * Parse embed data from callback
   */
  static parseEmbedData(embedData: string): any {
    try {
      return JSON.parse(embedData)
    } catch (error) {
      throw new PaymentError(
        'INVALID_EMBED_DATA',
        'Failed to parse embed data from callback'
      )
    }
  }

  /**
   * Get ZaloPay environment URLs
   */
  static getEnvironmentUrls(isProduction: boolean = false): {
    apiUrl: string
    gatewayUrl: string
  } {
    if (isProduction) {
      return {
        apiUrl: 'https://openapi.zalopay.vn/v2',
        gatewayUrl: 'https://zalopay.vn'
      }
    }

    return {
      apiUrl: 'https://sb-openapi.zalopay.vn/v2',
      gatewayUrl: 'https://sb-zalopay.vn'
    }
  }

  /**
   * Create payment URL for redirect
   */
  static createPaymentUrl(orderToken: string, isProduction: boolean = false): string {
    const { gatewayUrl } = this.getEnvironmentUrls(isProduction)
    return `${gatewayUrl}/order/${orderToken}`
  }

  /**
   * Validate payment URL
   */
  static validatePaymentUrl(url: string): { isValid: boolean; error?: string } {
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
   * Extract order token from payment URL
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
   * Create callback response
   */
  static createCallbackResponse(success: boolean, message: string = ''): {
    return_code: number
    return_message: string
  } {
    return {
      return_code: success ? 1 : -1,
      return_message: message || (success ? 'success' : 'failed')
    }
  }

  /**
   * Log payment event for debugging
   */
  static logPaymentEvent(
    event: string,
    appTransId: string,
    data?: any
  ): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[ZaloPay] ${event}:`, {
        appTransId,
        timestamp: new Date().toISOString(),
        data
      })
    }
  }
}

/**
 * ZaloPay URL utilities
 */
/**
 * Server-only ZaloPay URL utilities
 * IMPORTANT: Do not import this into client-side code. Uses Node APIs and should
 * only be used within backend/server environments.
 */
export class ZaloPayServerUrlUtils {
  /**
   * Build callback URL with session ID
   */
  static buildCallbackUrl(baseUrl: string, sessionId: string): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    return `${cleanBaseUrl}/api/v1/payment/zalopay/callback/${sessionId}`
  }

  /**
   * Build redirect URL with parameters
   */
  static buildRedirectUrl(
    baseUrl: string,
    sessionId: string,
    status: 'success' | 'cancel' | 'error' = 'success'
  ): string {
    const cleanBaseUrl = baseUrl.replace(/\/$/, '')
    return `${cleanBaseUrl}/dashboard/payment/confirmation?session=${sessionId}&status=${status}`
  }

  /**
   * Parse redirect URL parameters
   */
  static parseRedirectParams(url: string): {
    sessionId?: string
    status?: string
    appTransId?: string
    error?: string
  } {
    try {
      const urlObj = new URL(url)
      const params = urlObj.searchParams
      
      return {
        sessionId: params.get('session') || undefined,
        status: params.get('status') || undefined,
        appTransId: params.get('apptransid') || undefined,
        error: params.get('error') || undefined
      }
    } catch (error) {
      return {}
    }
  }

  /**
   * Validate callback URL format
   */
  static validateCallbackUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url)
      
      // Must be HTTPS in production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        return { isValid: false, error: 'Callback URL must use HTTPS in production' }
      }
      
      // Must have valid path
      if (!urlObj.pathname.includes('/payment/zalopay/callback')) {
        return { isValid: false, error: 'Invalid callback URL path' }
      }
      
      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' }
    }
  }

  /**
   * Validate redirect URL format
   */
  static validateRedirectUrl(url: string): { isValid: boolean; error?: string } {
    try {
      const urlObj = new URL(url)
      
      // Must be HTTPS in production
      if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
        return { isValid: false, error: 'Redirect URL must use HTTPS in production' }
      }
      
      // Must be same origin for security
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_APP_URL
      if (currentOrigin && urlObj.origin !== currentOrigin) {
        return { isValid: false, error: 'Redirect URL must be same origin' }
      }
      
      return { isValid: true }
    } catch (error) {
      return { isValid: false, error: 'Invalid URL format' }
    }
  }
}