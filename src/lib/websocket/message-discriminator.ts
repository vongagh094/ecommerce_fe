/**
 * WebSocket message discriminator
 * Validates, discriminates, and transforms incoming WebSocket messages
 */

import { 
  PaymentNotificationMessage, 
  AuctionResultMessage, 
  SecondChanceMessage, 
  PaymentStatusMessage, 
  BookingConfirmationMessage 
} from '@/types/auction-winners'

interface MessageValidationResult {
  isValid: boolean
  messageType: string | null
  errors: string[]
  transformedMessage?: PaymentNotificationMessage
}

interface MessageSchema {
  type: string
  requiredFields: string[]
  optionalFields: string[]
  validator: (data: any) => boolean
  transformer?: (data: any) => PaymentNotificationMessage
}

export class WebSocketMessageDiscriminator {
  private schemas = new Map<string, MessageSchema>()
  private validationStats = {
    total: 0,
    valid: 0,
    invalid: 0,
    byType: new Map<string, { valid: number; invalid: number }>()
  }

  constructor() {
    this.setupMessageSchemas()
  }

  /**
   * Setup message validation schemas
   */
  private setupMessageSchemas(): void {
    // Auction result message schema
    this.schemas.set('AUCTION_RESULT', {
      type: 'AUCTION_RESULT',
      requiredFields: ['type', 'auctionId', 'userId', 'result', 'amount', 'paymentDeadline', 'propertyName'],
      optionalFields: ['awardedNights'],
      validator: this.validateAuctionResult.bind(this),
      transformer: this.transformAuctionResult.bind(this)
    })

    // Second chance offer message schema
    this.schemas.set('SECOND_CHANCE_OFFER', {
      type: 'SECOND_CHANCE_OFFER',
      requiredFields: ['type', 'offerId', 'auctionId', 'userId', 'offeredNights', 'amount', 'responseDeadline', 'propertyName'],
      optionalFields: [],
      validator: this.validateSecondChanceOffer.bind(this),
      transformer: this.transformSecondChanceOffer.bind(this)
    })

    // Payment status message schema
    this.schemas.set('PAYMENT_STATUS', {
      type: 'PAYMENT_STATUS',
      requiredFields: ['type', 'paymentId', 'userId', 'status'],
      optionalFields: ['transactionId'],
      validator: this.validatePaymentStatus.bind(this),
      transformer: this.transformPaymentStatus.bind(this)
    })

    // Booking confirmation message schema
    this.schemas.set('BOOKING_CONFIRMED', {
      type: 'BOOKING_CONFIRMED',
      requiredFields: ['type', 'bookingId', 'userId', 'propertyName', 'checkIn', 'checkOut'],
      optionalFields: [],
      validator: this.validateBookingConfirmation.bind(this),
      transformer: this.transformBookingConfirmation.bind(this)
    })
  }

  /**
   * Discriminate and validate incoming message
   */
  discriminateMessage(rawMessage: any): MessageValidationResult {
    this.validationStats.total++

    try {
      // Basic structure validation
      if (!rawMessage || typeof rawMessage !== 'object') {
        return this.createValidationResult(false, null, ['Message must be a valid object'])
      }

      // Check for message type
      if (!rawMessage.type || typeof rawMessage.type !== 'string') {
        return this.createValidationResult(false, null, ['Message must have a valid type field'])
      }

      const messageType = rawMessage.type
      const schema = this.schemas.get(messageType)

      if (!schema) {
        return this.createValidationResult(false, messageType, [`Unknown message type: ${messageType}`])
      }

      // Validate required fields
      const missingFields = this.checkRequiredFields(rawMessage, schema.requiredFields)
      if (missingFields.length > 0) {
        return this.createValidationResult(false, messageType, [`Missing required fields: ${missingFields.join(', ')}`])
      }

      // Run custom validator
      if (!schema.validator(rawMessage)) {
        return this.createValidationResult(false, messageType, ['Message failed custom validation'])
      }

      // Transform message if transformer exists
      let transformedMessage: PaymentNotificationMessage
      if (schema.transformer) {
        transformedMessage = schema.transformer(rawMessage)
      } else {
        transformedMessage = rawMessage as PaymentNotificationMessage
      }

      // Update statistics
      this.updateStats(messageType, true)
      this.validationStats.valid++

      return this.createValidationResult(true, messageType, [], transformedMessage)

    } catch (error) {
      console.error('WebSocketMessageDiscriminator: Error discriminating message:', error)
      this.validationStats.invalid++
      return this.createValidationResult(false, null, [`Validation error: ${error}`])
    }
  }

  /**
   * Check for required fields in message
   */
  private checkRequiredFields(message: any, requiredFields: string[]): string[] {
    const missingFields: string[] = []
    
    for (const field of requiredFields) {
      if (!(field in message) || message[field] === null || message[field] === undefined) {
        missingFields.push(field)
      }
    }
    
    return missingFields
  }

  /**
   * Validate auction result message
   */
  private validateAuctionResult(data: any): boolean {
    // Validate result field
    const validResults = ['FULL_WIN', 'PARTIAL_WIN', 'LOST']
    if (!validResults.includes(data.result)) {
      return false
    }

    // Validate amount is positive number
    if (typeof data.amount !== 'number' || data.amount < 0) {
      return false
    }

    // Validate payment deadline is valid date string
    if (!this.isValidDateString(data.paymentDeadline)) {
      return false
    }

    // If partial win, validate awarded nights
    if (data.result === 'PARTIAL_WIN') {
      if (!Array.isArray(data.awardedNights) || data.awardedNights.length === 0) {
        return false
      }
    }

    return true
  }

  /**
   * Validate second chance offer message
   */
  private validateSecondChanceOffer(data: any): boolean {
    // Validate offered nights array
    if (!Array.isArray(data.offeredNights) || data.offeredNights.length === 0) {
      return false
    }

    // Validate amount is positive number
    if (typeof data.amount !== 'number' || data.amount < 0) {
      return false
    }

    // Validate response deadline is valid date string
    if (!this.isValidDateString(data.responseDeadline)) {
      return false
    }

    return true
  }

  /**
   * Validate payment status message
   */
  private validatePaymentStatus(data: any): boolean {
    // Validate status field
    const validStatuses = ['INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED']
    if (!validStatuses.includes(data.status)) {
      return false
    }

    return true
  }

  /**
   * Validate booking confirmation message
   */
  private validateBookingConfirmation(data: any): boolean {
    // Validate check-in and check-out dates
    if (!this.isValidDateString(data.checkIn) || !this.isValidDateString(data.checkOut)) {
      return false
    }

    // Validate check-in is before check-out
    const checkIn = new Date(data.checkIn)
    const checkOut = new Date(data.checkOut)
    if (checkIn >= checkOut) {
      return false
    }

    return true
  }

  /**
   * Transform auction result message
   */
  private transformAuctionResult(data: any): AuctionResultMessage {
    return {
      type: 'AUCTION_RESULT',
      auctionId: String(data.auctionId),
      userId: String(data.userId),
      result: data.result,
      awardedNights: data.awardedNights || [],
      amount: Number(data.amount),
      paymentDeadline: String(data.paymentDeadline),
      propertyName: String(data.propertyName)
    }
  }

  /**
   * Transform second chance offer message
   */
  private transformSecondChanceOffer(data: any): SecondChanceMessage {
    return {
      type: 'SECOND_CHANCE_OFFER',
      offerId: String(data.offerId),
      auctionId: String(data.auctionId),
      userId: String(data.userId),
      offeredNights: data.offeredNights.map((night: any) => String(night)),
      amount: Number(data.amount),
      responseDeadline: String(data.responseDeadline),
      propertyName: String(data.propertyName)
    }
  }

  /**
   * Transform payment status message
   */
  private transformPaymentStatus(data: any): PaymentStatusMessage {
    return {
      type: 'PAYMENT_STATUS',
      paymentId: String(data.paymentId),
      userId: String(data.userId),
      status: data.status,
      transactionId: data.transactionId ? String(data.transactionId) : undefined
    }
  }

  /**
   * Transform booking confirmation message
   */
  private transformBookingConfirmation(data: any): BookingConfirmationMessage {
    return {
      type: 'BOOKING_CONFIRMED',
      bookingId: String(data.bookingId),
      userId: String(data.userId),
      propertyName: String(data.propertyName),
      checkIn: String(data.checkIn),
      checkOut: String(data.checkOut)
    }
  }

  /**
   * Check if string is valid date
   */
  private isValidDateString(dateString: any): boolean {
    if (typeof dateString !== 'string') return false
    const date = new Date(dateString)
    return !isNaN(date.getTime())
  }

  /**
   * Create validation result object
   */
  private createValidationResult(
    isValid: boolean, 
    messageType: string | null, 
    errors: string[], 
    transformedMessage?: PaymentNotificationMessage
  ): MessageValidationResult {
    return {
      isValid,
      messageType,
      errors,
      transformedMessage
    }
  }

  /**
   * Update validation statistics
   */
  private updateStats(messageType: string, isValid: boolean): void {
    const typeStats = this.validationStats.byType.get(messageType) || { valid: 0, invalid: 0 }
    
    if (isValid) {
      typeStats.valid++
    } else {
      typeStats.invalid++
    }
    
    this.validationStats.byType.set(messageType, typeStats)
  }

  /**
   * Get validation statistics
   */
  getValidationStats(): {
    total: number
    valid: number
    invalid: number
    successRate: number
    byType: Record<string, { valid: number; invalid: number; successRate: number }>
  } {
    const byType: Record<string, { valid: number; invalid: number; successRate: number }> = {}
    
    for (const [type, stats] of this.validationStats.byType.entries()) {
      const total = stats.valid + stats.invalid
      byType[type] = {
        valid: stats.valid,
        invalid: stats.invalid,
        successRate: total > 0 ? (stats.valid / total) * 100 : 0
      }
    }

    return {
      total: this.validationStats.total,
      valid: this.validationStats.valid,
      invalid: this.validationStats.invalid,
      successRate: this.validationStats.total > 0 ? (this.validationStats.valid / this.validationStats.total) * 100 : 0,
      byType
    }
  }

  /**
   * Reset validation statistics
   */
  resetStats(): void {
    this.validationStats = {
      total: 0,
      valid: 0,
      invalid: 0,
      byType: new Map<string, { valid: number; invalid: number }>()
    }
  }

  /**
   * Add custom message schema
   */
  addMessageSchema(schema: MessageSchema): void {
    this.schemas.set(schema.type, schema)
  }

  /**
   * Remove message schema
   */
  removeMessageSchema(messageType: string): void {
    this.schemas.delete(messageType)
  }

  /**
   * Get supported message types
   */
  getSupportedMessageTypes(): string[] {
    return Array.from(this.schemas.keys())
  }
}