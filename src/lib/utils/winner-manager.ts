/**
 * Winner Manager - Central utility for managing auction winners
 * Combines data transformation, status tracking, and validation
 */

import { auctionWinnerApi } from '@/lib/api/auction-winners'
import { 
  WinnerDataTransformer,
  WinnerStatusTracker,
  WinnerBidValidator,
  PaymentNotification,
  NightRange,
  WinnerAction,
  ValidationResult
} from './winner-data-management'
import { notificationProcessor } from './winner-notification-processor'
import { 
  WinningBid, 
  SecondChanceOffer, 
  AwardedNight,
  WinnerStatus 
} from '@/types/auction-winners'

/**
 * Central winner management class
 * Requirements: 1.4, 3.3, 3.4, 6.3
 */
export class WinnerManager {
  /**
   * Get user's winning bids with enhanced data
   */
  static async getEnhancedWinningBids(params?: {
    status?: 'PENDING_PAYMENT' | 'PAID' | 'EXPIRED'
    includeExpired?: boolean
  }): Promise<EnhancedWinningBid[]> {
    try {
      const response = await auctionWinnerApi.getWinningBids(params)
      
      return response.winningBids.map(bid => ({
        ...bid,
        timeRemaining: WinnerStatusTracker.getTimeRemaining(bid.paymentDeadline),
        nextAction: WinnerStatusTracker.getNextAction(bid),
        nightRanges: WinnerDataTransformer.groupNightsIntoRanges(bid.awardedNights),
        isExpired: WinnerStatusTracker.isPaymentExpired(bid.paymentDeadline),
        selectedAmount: WinnerDataTransformer.calculateSelectedAmount(bid.awardedNights),
        validation: WinnerBidValidator.validateWinnerBid(bid)
      }))
    } catch (error) {
      console.error('Failed to get enhanced winning bids:', error)
      throw error
    }
  }

  /**
   * Process partial night selection
   */
  static async processPartialSelection(
    auctionId: string,
    selectedNights: AwardedNight[],
    minimumStay?: number
  ): Promise<PartialSelectionResult> {
    // Validate selection
    const validation = WinnerBidValidator.validateNightSelection(selectedNights, minimumStay)
    
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      }
    }

    try {
      // Calculate total amount
      const totalAmount = WinnerDataTransformer.calculateSelectedAmount(selectedNights)
      
      // Accept partial offer with selected nights
      const response = await auctionWinnerApi.acceptPartialOffer(auctionId, {
        selectedNights: selectedNights.map(night => night.date)
      })

      return {
        success: true,
        paymentSessionId: response.paymentSessionId,
        totalAmount: response.totalAmount,
        selectedNights
      }
    } catch (error) {
      console.error('Failed to process partial selection:', error)
      return {
        success: false,
        errors: ['Failed to process selection. Please try again.']
      }
    }
  }

  /**
   * Decline partial offer with fallback handling
   */
  static async declinePartialOffer(auctionId: string): Promise<DeclineResult> {
    try {
      const response = await auctionWinnerApi.declinePartialOffer(auctionId)
      
      return {
        success: response.success,
        fallbackTriggered: response.fallbackTriggered,
        nextBidderNotified: response.nextBidderNotified,
        message: response.fallbackTriggered 
          ? 'Offer declined. Next bidder has been notified.'
          : 'Offer declined.'
      }
    } catch (error) {
      console.error('Failed to decline partial offer:', error)
      return {
        success: false,
        fallbackTriggered: false,
        nextBidderNotified: false,
        message: 'Failed to decline offer. Please try again.'
      }
    }
  }

  /**
   * Handle second chance offer response
   */
  static async handleSecondChanceOffer(
    offerId: string,
    action: 'ACCEPTED' | 'DECLINED',
    reason?: string
  ): Promise<SecondChanceResult> {
    try {
      if (action === 'ACCEPTED') {
        const response = await auctionWinnerApi.acceptSecondChanceOffer({ offerId })
        
        return {
          success: response.success,
          action: 'ACCEPTED',
          paymentSessionId: response.paymentSessionId,
          totalAmount: response.totalAmount,
          message: 'Second chance offer accepted! Proceed to payment.'
        }
      } else {
        const response = await auctionWinnerApi.declineSecondChanceOffer({ offerId, reason })
        
        return {
          success: response.success,
          action: 'DECLINED',
          nextBidderNotified: response.nextBidderNotified,
          message: 'Second chance offer declined.'
        }
      }
    } catch (error) {
      console.error('Failed to handle second chance offer:', error)
      return {
        success: false,
        action,
        message: 'Failed to process offer response. Please try again.'
      }
    }
  }

  /**
   * Get winner dashboard data
   */
  static async getDashboardData(): Promise<WinnerDashboardData> {
    try {
      const [winningBids, secondChanceOffers, statistics] = await Promise.all([
        this.getEnhancedWinningBids(),
        auctionWinnerApi.getSecondChanceOffers(),
        auctionWinnerApi.getWinnerStatistics()
      ])

      const notifications = notificationProcessor.getNotifications()
      
      return {
        winningBids,
        secondChanceOffers: secondChanceOffers.offers,
        statistics,
        notifications,
        unreadCount: notificationProcessor.getUnreadCount(),
        pendingActions: this.getPendingActions(winningBids, secondChanceOffers.offers)
      }
    } catch (error) {
      console.error('Failed to get dashboard data:', error)
      throw error
    }
  }

  /**
   * Update winner status with validation
   */
  static async updateWinnerStatus(
    auctionId: string,
    newStatus: WinnerStatus,
    currentStatus?: WinnerStatus
  ): Promise<StatusUpdateResult> {
    // Validate status transition if current status is provided
    if (currentStatus) {
      const validation = WinnerStatusTracker.validateStatusTransition(currentStatus, newStatus)
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.reason || 'Invalid status transition'
        }
      }
    }

    try {
      const response = await auctionWinnerApi.updateWinnerStatus(auctionId, newStatus)
      
      return {
        success: response.success,
        newStatus
      }
    } catch (error) {
      console.error('Failed to update winner status:', error)
      return {
        success: false,
        error: 'Failed to update status. Please try again.'
      }
    }
  }

  /**
   * Get pending actions for dashboard
   */
  private static getPendingActions(
    winningBids: EnhancedWinningBid[],
    secondChanceOffers: SecondChanceOffer[]
  ): PendingAction[] {
    const actions: PendingAction[] = []

    // Add actions for winning bids
    winningBids.forEach(bid => {
      if (bid.nextAction.type !== 'COMPLETED' && bid.nextAction.type !== 'EXPIRED') {
        actions.push({
          id: bid.id,
          type: 'WINNING_BID',
          title: bid.isPartialWin ? 'Select Nights' : 'Complete Payment',
          description: bid.nextAction.message,
          actionUrl: bid.nextAction.actionUrl,
          priority: bid.timeRemaining.hours < 2 ? 'HIGH' : 'MEDIUM',
          deadline: bid.paymentDeadline,
          amount: bid.selectedAmount || bid.bidAmount
        })
      }
    })

    // Add actions for second chance offers
    secondChanceOffers.forEach(offer => {
      if (offer.status === 'WAITING' && !WinnerStatusTracker.isOfferExpired(offer.responseDeadline)) {
        actions.push({
          id: offer.id,
          type: 'SECOND_CHANCE',
          title: 'Second Chance Offer',
          description: 'Respond to second chance offer',
          actionUrl: `/dashboard/offers/${offer.id}`,
          priority: 'HIGH',
          deadline: offer.responseDeadline,
          amount: offer.amount
        })
      }
    })

    // Sort by priority and deadline
    return actions.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority === 'HIGH' ? -1 : 1
      }
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    })
  }

  /**
   * Clean up expired data
   */
  static async cleanupExpiredData(): Promise<void> {
    try {
      // Remove expired notifications
      const notifications = notificationProcessor.getNotifications()
      const now = new Date()
      
      notifications.forEach(notification => {
        if (notification.expiresAt && new Date(notification.expiresAt) < now) {
          notificationProcessor.removeNotification(notification.id)
        }
      })
    } catch (error) {
      console.error('Failed to cleanup expired data:', error)
    }
  }
}

// Enhanced interfaces
export interface EnhancedWinningBid extends WinningBid {
  timeRemaining: {
    hours: number
    minutes: number
    seconds: number
    isExpired: boolean
  }
  nextAction: WinnerAction
  nightRanges: NightRange[]
  isExpired: boolean
  selectedAmount: number
  validation: ValidationResult
}

export interface PartialSelectionResult {
  success: boolean
  paymentSessionId?: string
  totalAmount?: number
  selectedNights?: AwardedNight[]
  errors?: string[]
}

export interface DeclineResult {
  success: boolean
  fallbackTriggered: boolean
  nextBidderNotified: boolean
  message: string
}

export interface SecondChanceResult {
  success: boolean
  action: 'ACCEPTED' | 'DECLINED'
  paymentSessionId?: string
  totalAmount?: number
  nextBidderNotified?: boolean
  message: string
}

export interface StatusUpdateResult {
  success: boolean
  newStatus?: WinnerStatus
  error?: string
}

export interface WinnerDashboardData {
  winningBids: EnhancedWinningBid[]
  secondChanceOffers: SecondChanceOffer[]
  statistics: {
    totalWins: number
    pendingPayments: number
    completedBookings: number
    expiredOffers: number
  }
  notifications: PaymentNotification[]
  unreadCount: number
  pendingActions: PendingAction[]
}

export interface PendingAction {
  id: string
  type: 'WINNING_BID' | 'SECOND_CHANCE'
  title: string
  description: string
  actionUrl?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  deadline: string
  amount: number
}