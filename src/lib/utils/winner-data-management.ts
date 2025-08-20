/**
 * Winner Data Management Utilities
 * Handles data transformation, status tracking, and validation for auction winners
 */

import { 
  WinningBid, 
  AuctionWinner, 
  SecondChanceOffer, 
  AwardedNight, 
  PartialNight,
  WinnerStatus,
  AuctionResultMessage,
  SecondChanceMessage,
  PaymentNotificationMessage
} from '@/types/auction-winners'
import { PropertyDetails } from '@/types'

/**
 * Data transformation utilities for auction winner data
 * Requirements: 1.4, 3.3, 3.4
 */
export class WinnerDataTransformer {
  /**
   * Transform backend auction winner data to frontend WinningBid format
   */
  static transformToWinningBid(
    winner: AuctionWinner, 
    property: PropertyDetails,
    awardedNights: PartialNight[]
  ): WinningBid {
    const transformedNights: AwardedNight[] = awardedNights.map((night, index) => ({
      date: night.date,
      pricePerNight: night.pricePerNight,
      isSelected: night.isAwarded,
      rangeId: this.generateRangeId(night.date, awardedNights)
    }))

    return {
      id: winner.id,
      auctionId: winner.auctionId,
      property,
      bidAmount: winner.totalAmount,
      checkIn: this.getEarliestDate(winner.awardedNights),
      checkOut: this.getLatestDate(winner.awardedNights),
      isPartialWin: winner.winType === 'PARTIAL',
      awardedNights: transformedNights,
      status: this.mapWinnerStatusToBidStatus(winner.status),
      paymentDeadline: winner.paymentDeadline
    }
  }

  /**
   * Transform WebSocket auction result message to notification data
   */
  static transformAuctionResultToNotification(
    message: AuctionResultMessage
  ): PaymentNotification {
    return {
      id: message.auctionId,
      type: message.result === 'FULL_WIN' ? 'FULL_WINNER' : 'PARTIAL_WINNER',
      title: message.result === 'FULL_WIN' 
        ? 'Congratulations! You won the auction!' 
        : 'You won partial nights!',
      message: `Property: ${message.propertyName}`,
      amount: message.amount,
      actionRequired: true,
      timestamp: new Date().toISOString(),
      expiresAt: message.paymentDeadline,
      auctionId: message.auctionId,
      propertyName: message.propertyName,
      awardedNights: message.awardedNights
    }
  }

  /**
   * Transform second chance offer message to notification data
   */
  static transformSecondChanceToNotification(
    message: SecondChanceMessage
  ): PaymentNotification {
    return {
      id: message.offerId,
      type: 'SECOND_CHANCE',
      title: 'Second chance offer available!',
      message: `New offer for ${message.propertyName}`,
      amount: message.amount,
      actionRequired: true,
      timestamp: new Date().toISOString(),
      expiresAt: message.responseDeadline,
      auctionId: message.auctionId,
      offerId: message.offerId,
      propertyName: message.propertyName,
      offeredNights: message.offeredNights
    }
  }

  /**
   * Calculate total amount for selected nights
   */
  static calculateSelectedAmount(awardedNights: AwardedNight[]): number {
    return awardedNights
      .filter(night => night.isSelected)
      .reduce((total, night) => total + night.pricePerNight, 0)
  }

  /**
   * Group consecutive nights into ranges
   */
  static groupNightsIntoRanges(nights: AwardedNight[]): NightRange[] {
    if (nights.length === 0) return []

    const sortedNights = [...nights].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    const ranges: NightRange[] = []
    let currentRange: NightRange = {
      id: this.generateRangeId(sortedNights[0].date, nights),
      startDate: sortedNights[0].date,
      endDate: sortedNights[0].date,
      nights: [sortedNights[0]],
      totalAmount: sortedNights[0].pricePerNight,
      isSelected: sortedNights[0].isSelected
    }

    for (let i = 1; i < sortedNights.length; i++) {
      const currentNight = sortedNights[i]
      const previousDate = new Date(sortedNights[i - 1].date)
      const currentDate = new Date(currentNight.date)
      
      // Check if dates are consecutive
      const dayDifference = (currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24)
      
      if (dayDifference === 1) {
        // Extend current range
        currentRange.endDate = currentNight.date
        currentRange.nights.push(currentNight)
        currentRange.totalAmount += currentNight.pricePerNight
        currentRange.isSelected = currentRange.isSelected && currentNight.isSelected
      } else {
        // Start new range
        ranges.push(currentRange)
        currentRange = {
          id: this.generateRangeId(currentNight.date, nights),
          startDate: currentNight.date,
          endDate: currentNight.date,
          nights: [currentNight],
          totalAmount: currentNight.pricePerNight,
          isSelected: currentNight.isSelected
        }
      }
    }
    
    ranges.push(currentRange)
    return ranges
  }

  /**
   * Generate range ID for grouping consecutive nights
   */
  private static generateRangeId(date: string, allNights: (PartialNight | AwardedNight)[]): string {
    const dateObj = new Date(date)
    const index = allNights.findIndex(night => night.date === date)
    return `range-${dateObj.getTime()}-${index}`
  }

  /**
   * Get earliest date from awarded nights
   */
  private static getEarliestDate(nights: string[]): string {
    return nights.sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
  }

  /**
   * Get latest date from awarded nights (add 1 day for checkout)
   */
  private static getLatestDate(nights: string[]): string {
    const latestDate = nights.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]
    const checkoutDate = new Date(latestDate)
    checkoutDate.setDate(checkoutDate.getDate() + 1)
    return checkoutDate.toISOString().split('T')[0]
  }

  /**
   * Map winner status to bid status
   */
  private static mapWinnerStatusToBidStatus(status: WinnerStatus): 'PENDING_PAYMENT' | 'PAID' | 'EXPIRED' {
    switch (status) {
      case 'NOTIFIED':
      case 'CONFIRMED':
        return 'PENDING_PAYMENT'
      case 'PAID':
        return 'PAID'
      case 'DECLINED':
      case 'EXPIRED':
        return 'EXPIRED'
      default:
        return 'PENDING_PAYMENT'
    }
  }
}

/**
 * Winner status tracking and updates
 * Requirements: 1.4, 3.3, 3.4, 6.3
 */
export class WinnerStatusTracker {
  /**
   * Check if payment deadline has passed
   */
  static isPaymentExpired(paymentDeadline: string): boolean {
    return new Date() > new Date(paymentDeadline)
  }

  /**
   * Check if second chance offer has expired
   */
  static isOfferExpired(responseDeadline: string): boolean {
    return new Date() > new Date(responseDeadline)
  }

  /**
   * Get time remaining for payment
   */
  static getTimeRemaining(deadline: string): {
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  } {
    const now = new Date().getTime()
    const deadlineTime = new Date(deadline).getTime()
    const difference = deadlineTime - now

    if (difference <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, isExpired: true }
    }

    const hours = Math.floor(difference / (1000 * 60 * 60))
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((difference % (1000 * 60)) / 1000)

    return { hours, minutes, seconds, isExpired: false }
  }

  /**
   * Determine next action for winner based on status
   */
  static getNextAction(winner: WinningBid): WinnerAction {
    if (this.isPaymentExpired(winner.paymentDeadline)) {
      return { type: 'EXPIRED', message: 'Payment deadline has passed' }
    }

    switch (winner.status) {
      case 'PENDING_PAYMENT':
        if (winner.isPartialWin) {
          return { 
            type: 'SELECT_NIGHTS', 
            message: 'Select which nights you want to book',
            actionUrl: `/dashboard/winners/partial/${winner.auctionId}`
          }
        } else {
          return { 
            type: 'PAY_NOW', 
            message: 'Complete your payment to secure the booking',
            actionUrl: `/dashboard/winners/${winner.auctionId}`
          }
        }
      case 'PAID':
        return { type: 'COMPLETED', message: 'Booking confirmed' }
      case 'EXPIRED':
        return { type: 'EXPIRED', message: 'Offer has expired' }
      default:
        return { type: 'UNKNOWN', message: 'Unknown status' }
    }
  }

  /**
   * Update winner status with validation
   */
  static validateStatusTransition(
    currentStatus: WinnerStatus, 
    newStatus: WinnerStatus
  ): { isValid: boolean; reason?: string } {
    const validTransitions: Record<WinnerStatus, WinnerStatus[]> = {
      'NOTIFIED': ['CONFIRMED', 'DECLINED', 'EXPIRED'],
      'CONFIRMED': ['PAID', 'EXPIRED'],
      'DECLINED': [], // Terminal state
      'PAID': [], // Terminal state
      'EXPIRED': [] // Terminal state
    }

    const allowedTransitions = validTransitions[currentStatus] || []
    
    if (!allowedTransitions.includes(newStatus)) {
      return {
        isValid: false,
        reason: `Cannot transition from ${currentStatus} to ${newStatus}`
      }
    }

    return { isValid: true }
  }
}

/**
 * Winner bid validation and verification logic
 * Requirements: 1.4, 3.3, 3.4, 6.3
 */
export class WinnerBidValidator {
  /**
   * Validate partial night selection
   */
  static validateNightSelection(
    selectedNights: AwardedNight[],
    minimumStay?: number
  ): ValidationResult {
    if (selectedNights.length === 0) {
      return {
        isValid: false,
        errors: ['At least one night must be selected']
      }
    }

    if (minimumStay && selectedNights.length < minimumStay) {
      return {
        isValid: false,
        errors: [`Minimum stay of ${minimumStay} nights required`]
      }
    }

    // Check for valid date format
    const invalidDates = selectedNights.filter(night => 
      isNaN(new Date(night.date).getTime())
    )

    if (invalidDates.length > 0) {
      return {
        isValid: false,
        errors: ['Invalid date format in selected nights']
      }
    }

    // Check for positive prices
    const invalidPrices = selectedNights.filter(night => 
      night.pricePerNight <= 0
    )

    if (invalidPrices.length > 0) {
      return {
        isValid: false,
        errors: ['All selected nights must have valid prices']
      }
    }

    return { isValid: true, errors: [] }
  }

  /**
   * Validate winner bid data integrity
   */
  static validateWinnerBid(bid: WinningBid): ValidationResult {
    const errors: string[] = []

    // Basic field validation
    if (!bid.id || !bid.auctionId) {
      errors.push('Missing required bid identifiers')
    }

    if (!bid.property || !bid.property.id) {
      errors.push('Missing property information')
    }

    if (bid.bidAmount <= 0) {
      errors.push('Bid amount must be positive')
    }

    if (!bid.checkIn || !bid.checkOut) {
      errors.push('Missing check-in or check-out dates')
    }

    // Date validation
    const checkInDate = new Date(bid.checkIn)
    const checkOutDate = new Date(bid.checkOut)

    if (checkInDate >= checkOutDate) {
      errors.push('Check-out date must be after check-in date')
    }

    // Awarded nights validation
    if (bid.awardedNights.length === 0) {
      errors.push('No awarded nights specified')
    }

    // Payment deadline validation
    if (!bid.paymentDeadline) {
      errors.push('Missing payment deadline')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate second chance offer
   */
  static validateSecondChanceOffer(offer: SecondChanceOffer): ValidationResult {
    const errors: string[] = []

    if (!offer.id || !offer.auctionId || !offer.userId) {
      errors.push('Missing required offer identifiers')
    }

    if (offer.amount <= 0) {
      errors.push('Offer amount must be positive')
    }

    if (!offer.offeredNights || offer.offeredNights.length === 0) {
      errors.push('No offered nights specified')
    }

    if (!offer.responseDeadline) {
      errors.push('Missing response deadline')
    }

    // Check if offer has expired
    if (WinnerStatusTracker.isOfferExpired(offer.responseDeadline)) {
      errors.push('Offer has expired')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Supporting interfaces
export interface PaymentNotification {
  id: string
  type: 'FULL_WINNER' | 'PARTIAL_WINNER' | 'SECOND_CHANCE' | 'PAYMENT_STATUS'
  title: string
  message: string
  amount: number
  actionRequired: boolean
  timestamp: string
  expiresAt?: string
  auctionId?: string
  offerId?: string
  propertyName?: string
  awardedNights?: string[]
  offeredNights?: string[]
}

export interface NightRange {
  id: string
  startDate: string
  endDate: string
  nights: AwardedNight[]
  totalAmount: number
  isSelected: boolean
}

export interface WinnerAction {
  type: 'PAY_NOW' | 'SELECT_NIGHTS' | 'COMPLETED' | 'EXPIRED' | 'UNKNOWN'
  message: string
  actionUrl?: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}