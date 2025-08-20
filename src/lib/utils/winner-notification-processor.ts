/**
 * Winner Notification Data Processing
 * Handles WebSocket message processing and notification state management
 */

import { 
  PaymentNotificationMessage,
  AuctionResultMessage,
  SecondChanceMessage,
  PaymentStatusMessage,
  BookingConfirmationMessage
} from '@/types/auction-winners'
import { 
  PaymentNotification,
  WinnerDataTransformer 
} from './winner-data-management'

/**
 * Notification processor for handling WebSocket messages
 * Requirements: 1.4, 3.3, 3.4, 6.3
 */
export class WinnerNotificationProcessor {
  private notifications: Map<string, PaymentNotification> = new Map()
  private listeners: Set<NotificationListener> = new Set()

  /**
   * Process incoming WebSocket message
   */
  processMessage(message: PaymentNotificationMessage): void {
    switch (message.type) {
      case 'AUCTION_RESULT':
        this.handleAuctionResult(message)
        break
      case 'SECOND_CHANCE_OFFER':
        this.handleSecondChanceOffer(message)
        break
      case 'PAYMENT_STATUS':
        this.handlePaymentStatus(message)
        break
      case 'BOOKING_CONFIRMED':
        this.handleBookingConfirmation(message)
        break
      default:
        console.warn('Unknown message type:', message)
    }
  }

  /**
   * Handle auction result notification
   */
  private handleAuctionResult(message: AuctionResultMessage): void {
    const notification = WinnerDataTransformer.transformAuctionResultToNotification(message)
    this.addNotification(notification)
    
    // Notify listeners
    this.notifyListeners({
      type: 'AUCTION_RESULT_RECEIVED',
      notification,
      data: message
    })
  }

  /**
   * Handle second chance offer notification
   */
  private handleSecondChanceOffer(message: SecondChanceMessage): void {
    const notification = WinnerDataTransformer.transformSecondChanceToNotification(message)
    this.addNotification(notification)
    
    // Start countdown timer for offer expiration
    this.startOfferCountdown(message.offerId, message.responseDeadline)
    
    // Notify listeners
    this.notifyListeners({
      type: 'SECOND_CHANCE_RECEIVED',
      notification,
      data: message
    })
  }

  /**
   * Handle payment status update
   */
  private handlePaymentStatus(message: PaymentStatusMessage): void {
    // Find existing payment notification and update it
    const existingNotification = this.findNotificationByPaymentId(message.paymentId)
    
    if (existingNotification) {
      const updatedNotification: PaymentNotification = {
        ...existingNotification,
        type: 'PAYMENT_STATUS',
        title: this.getPaymentStatusTitle(message.status),
        message: this.getPaymentStatusMessage(message.status, message.transactionId),
        actionRequired: message.status === 'FAILED',
        timestamp: new Date().toISOString()
      }
      
      this.updateNotification(updatedNotification)
    } else {
      // Create new payment status notification
      const notification: PaymentNotification = {
        id: message.paymentId,
        type: 'PAYMENT_STATUS',
        title: this.getPaymentStatusTitle(message.status),
        message: this.getPaymentStatusMessage(message.status, message.transactionId),
        amount: 0, // Amount not available in status message
        actionRequired: message.status === 'FAILED',
        timestamp: new Date().toISOString()
      }
      
      this.addNotification(notification)
    }
    
    // Notify listeners
    this.notifyListeners({
      type: 'PAYMENT_STATUS_UPDATED',
      notification: this.notifications.get(message.paymentId)!,
      data: message
    })
  }

  /**
   * Handle booking confirmation
   */
  private handleBookingConfirmation(message: BookingConfirmationMessage): void {
    const notification: PaymentNotification = {
      id: message.bookingId,
      type: 'PAYMENT_STATUS',
      title: 'Booking Confirmed!',
      message: `Your booking for ${message.propertyName} is confirmed`,
      amount: 0,
      actionRequired: false,
      timestamp: new Date().toISOString(),
      propertyName: message.propertyName
    }
    
    this.addNotification(notification)
    
    // Remove any related payment notifications
    this.removeExpiredNotifications()
    
    // Notify listeners
    this.notifyListeners({
      type: 'BOOKING_CONFIRMED',
      notification,
      data: message
    })
  }

  /**
   * Add notification to the collection
   */
  private addNotification(notification: PaymentNotification): void {
    this.notifications.set(notification.id, notification)
    
    // Auto-remove expired notifications
    this.scheduleNotificationCleanup(notification)
  }

  /**
   * Update existing notification
   */
  private updateNotification(notification: PaymentNotification): void {
    if (this.notifications.has(notification.id)) {
      this.notifications.set(notification.id, notification)
    }
  }

  /**
   * Remove notification by ID
   */
  removeNotification(id: string): void {
    this.notifications.delete(id)
    
    this.notifyListeners({
      type: 'NOTIFICATION_REMOVED',
      notificationId: id
    })
  }

  /**
   * Get all active notifications
   */
  getNotifications(): PaymentNotification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  /**
   * Get notifications by type
   */
  getNotificationsByType(type: PaymentNotification['type']): PaymentNotification[] {
    return this.getNotifications().filter(notification => notification.type === type)
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(): number {
    return this.getNotifications().filter(notification => notification.actionRequired).length
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): void {
    const notification = this.notifications.get(id)
    if (notification) {
      const updatedNotification = {
        ...notification,
        actionRequired: false
      }
      this.updateNotification(updatedNotification)
    }
  }

  /**
   * Add notification listener
   */
  addListener(listener: NotificationListener): void {
    this.listeners.add(listener)
  }

  /**
   * Remove notification listener
   */
  removeListener(listener: NotificationListener): void {
    this.listeners.delete(listener)
  }

  /**
   * Notify all listeners of notification events
   */
  private notifyListeners(event: NotificationEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event)
      } catch (error) {
        console.error('Error in notification listener:', error)
      }
    })
  }

  /**
   * Find notification by payment ID
   */
  private findNotificationByPaymentId(paymentId: string): PaymentNotification | undefined {
    return Array.from(this.notifications.values())
      .find(notification => notification.id === paymentId)
  }

  /**
   * Start countdown timer for offer expiration
   */
  private startOfferCountdown(offerId: string, deadline: string): void {
    const deadlineTime = new Date(deadline).getTime()
    const now = new Date().getTime()
    const timeRemaining = deadlineTime - now

    if (timeRemaining > 0) {
      setTimeout(() => {
        const notification = this.notifications.get(offerId)
        if (notification && notification.type === 'SECOND_CHANCE') {
          // Mark as expired
          const expiredNotification: PaymentNotification = {
            ...notification,
            title: 'Second Chance Offer Expired',
            actionRequired: false
          }
          this.updateNotification(expiredNotification)
          
          // Auto-remove after 5 minutes
          setTimeout(() => {
            this.removeNotification(offerId)
          }, 5 * 60 * 1000)
        }
      }, timeRemaining)
    }
  }

  /**
   * Schedule notification cleanup for expired notifications
   */
  private scheduleNotificationCleanup(notification: PaymentNotification): void {
    if (notification.expiresAt) {
      const expirationTime = new Date(notification.expiresAt).getTime()
      const now = new Date().getTime()
      const timeUntilExpiration = expirationTime - now

      if (timeUntilExpiration > 0) {
        setTimeout(() => {
          this.removeNotification(notification.id)
        }, timeUntilExpiration + (10 * 60 * 1000)) // Remove 10 minutes after expiration
      }
    }
  }

  /**
   * Remove expired notifications
   */
  private removeExpiredNotifications(): void {
    const now = new Date()
    const expiredIds: string[] = []

    this.notifications.forEach((notification, id) => {
      if (notification.expiresAt && new Date(notification.expiresAt) < now) {
        expiredIds.push(id)
      }
    })

    expiredIds.forEach(id => this.removeNotification(id))
  }

  /**
   * Get payment status title
   */
  private getPaymentStatusTitle(status: PaymentStatusMessage['status']): string {
    switch (status) {
      case 'INITIATED':
        return 'Payment Initiated'
      case 'PROCESSING':
        return 'Processing Payment...'
      case 'COMPLETED':
        return 'Payment Successful!'
      case 'FAILED':
        return 'Payment Failed'
      default:
        return 'Payment Update'
    }
  }

  /**
   * Get payment status message
   */
  private getPaymentStatusMessage(
    status: PaymentStatusMessage['status'], 
    transactionId?: string
  ): string {
    switch (status) {
      case 'INITIATED':
        return 'Your payment has been initiated'
      case 'PROCESSING':
        return 'Please wait while we process your payment'
      case 'COMPLETED':
        return transactionId 
          ? `Payment completed successfully. Transaction ID: ${transactionId}`
          : 'Payment completed successfully'
      case 'FAILED':
        return 'Payment failed. Please try again or contact support'
      default:
        return 'Payment status updated'
    }
  }
}

// Notification event types
export interface NotificationEvent {
  type: 'AUCTION_RESULT_RECEIVED' | 'SECOND_CHANCE_RECEIVED' | 'PAYMENT_STATUS_UPDATED' | 'BOOKING_CONFIRMED' | 'NOTIFICATION_REMOVED'
  notification?: PaymentNotification
  notificationId?: string
  data?: PaymentNotificationMessage
}

export type NotificationListener = (event: NotificationEvent) => void

// Singleton instance for global notification processing
export const notificationProcessor = new WinnerNotificationProcessor()