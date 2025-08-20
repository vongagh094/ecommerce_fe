/**
 * WebSocket message handler with discrimination, routing, and deduplication
 * Handles message processing, ordering, and notification creation
 */

import { PaymentNotificationMessage } from '@/types/auction-winners'
import { PaymentNotification } from '@/types/payment'

interface ProcessedMessage {
  id: string
  timestamp: number
  processed: boolean
  message: PaymentNotificationMessage
}

interface MessageHandlerOptions {
  maxMessageHistory: number
  duplicateWindowMs: number
  onNotificationCreated: (notification: PaymentNotification) => void
  onStatusUpdate: (update: StatusUpdate) => void
}

interface StatusUpdate {
  type: 'payment' | 'booking' | 'auction'
  id: string
  status: string
  data?: any
}

export class WebSocketMessageHandler {
  private processedMessages = new Map<string, ProcessedMessage>()
  private messageQueue: PaymentNotificationMessage[] = []
  private isProcessing = false
  private options: MessageHandlerOptions

  constructor(options: MessageHandlerOptions) {
    this.options = options
    
    // Clean up old messages periodically
    setInterval(() => {
      this.cleanupOldMessages()
    }, 60000) // Every minute
  }

  /**
   * Process incoming WebSocket message
   */
  processMessage(message: PaymentNotificationMessage): void {
    // Generate message ID for deduplication
    const messageId = this.generateMessageId(message)
    
    // Check for duplicates
    if (this.isDuplicate(messageId)) {
      console.log('WebSocketMessageHandler: Duplicate message ignored', messageId)
      return
    }

    // Add to processed messages
    this.processedMessages.set(messageId, {
      id: messageId,
      timestamp: Date.now(),
      processed: false,
      message
    })

    // Add to queue for ordered processing
    this.messageQueue.push(message)
    
    // Process queue
    this.processQueue()
  }

  /**
   * Generate unique message ID for deduplication
   */
  private generateMessageId(message: PaymentNotificationMessage): string {
    switch (message.type) {
      case 'AUCTION_RESULT':
        return `auction_${message.auctionId}_${message.userId}_${message.result}`
      case 'SECOND_CHANCE_OFFER':
        return `offer_${message.offerId}_${message.userId}`
      case 'PAYMENT_STATUS':
        return `payment_${message.paymentId}_${message.status}_${message.transactionId || 'no_tx'}`
      case 'BOOKING_CONFIRMED':
        return `booking_${message.bookingId}_${message.userId}`
      default:
        return `unknown_${Date.now()}_${Math.random()}`
    }
  }

  /**
   * Check if message is duplicate within the deduplication window
   */
  private isDuplicate(messageId: string): boolean {
    const existing = this.processedMessages.get(messageId)
    if (!existing) return false

    const now = Date.now()
    const timeDiff = now - existing.timestamp
    
    return timeDiff < this.options.duplicateWindowMs
  }

  /**
   * Process message queue in order
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return
    }

    this.isProcessing = true

    try {
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()!
        await this.handleMessage(message)
      }
    } catch (error) {
      console.error('WebSocketMessageHandler: Error processing queue:', error)
    } finally {
      this.isProcessing = false
    }
  }

  /**
   * Handle individual message based on type
   */
  private async handleMessage(message: PaymentNotificationMessage): Promise<void> {
    try {
      switch (message.type) {
        case 'AUCTION_RESULT':
          await this.handleAuctionResult(message)
          break
        case 'SECOND_CHANCE_OFFER':
          await this.handleSecondChanceOffer(message)
          break
        case 'PAYMENT_STATUS':
          await this.handlePaymentStatus(message)
          break
        case 'BOOKING_CONFIRMED':
          await this.handleBookingConfirmation(message)
          break
        default:
          console.warn('WebSocketMessageHandler: Unknown message type:', (message as any).type)
      }
    } catch (error) {
      console.error('WebSocketMessageHandler: Error handling message:', error, message)
    }
  }

  /**
   * Handle auction result messages
   */
  private async handleAuctionResult(message: PaymentNotificationMessage & { type: 'AUCTION_RESULT' }): Promise<void> {
    const notification: PaymentNotification = {
      id: `auction_${message.auctionId}_${Date.now()}`,
      type: 'WINNER',
      title: this.getAuctionResultTitle(message.result),
      message: this.getAuctionResultMessage(message),
      amount: message.amount,
      actionRequired: true,
      timestamp: new Date().toISOString()
    }

    this.options.onNotificationCreated(notification)

    // Send status update
    this.options.onStatusUpdate({
      type: 'auction',
      id: message.auctionId,
      status: message.result,
      data: {
        awardedNights: message.awardedNights,
        amount: message.amount,
        paymentDeadline: message.paymentDeadline
      }
    })
  }

  /**
   * Handle second chance offer messages
   */
  private async handleSecondChanceOffer(message: PaymentNotificationMessage & { type: 'SECOND_CHANCE_OFFER' }): Promise<void> {
    const notification: PaymentNotification = {
      id: `offer_${message.offerId}_${Date.now()}`,
      type: 'SECOND_CHANCE',
      title: 'Second chance offer available!',
      message: `New offer for ${message.propertyName} - ${message.offeredNights.length} nights available`,
      amount: message.amount,
      actionRequired: true,
      expiresAt: message.responseDeadline,
      timestamp: new Date().toISOString()
    }

    this.options.onNotificationCreated(notification)

    // Send status update
    this.options.onStatusUpdate({
      type: 'auction',
      id: message.auctionId,
      status: 'SECOND_CHANCE_OFFERED',
      data: {
        offerId: message.offerId,
        offeredNights: message.offeredNights,
        amount: message.amount,
        responseDeadline: message.responseDeadline
      }
    })
  }

  /**
   * Handle payment status messages
   */
  private async handlePaymentStatus(message: PaymentNotificationMessage & { type: 'PAYMENT_STATUS' }): Promise<void> {
    // Create notification for significant status changes
    if (['COMPLETED', 'FAILED'].includes(message.status)) {
      const notification: PaymentNotification = {
        id: `payment_${message.paymentId}_${Date.now()}`,
        type: 'PAYMENT_STATUS',
        title: this.getPaymentStatusTitle(message.status),
        message: this.getPaymentStatusMessage(message.status, message.transactionId),
        actionRequired: message.status === 'FAILED',
        timestamp: new Date().toISOString()
      }

      this.options.onNotificationCreated(notification)
    }

    // Always send status update
    this.options.onStatusUpdate({
      type: 'payment',
      id: message.paymentId,
      status: message.status,
      data: {
        transactionId: message.transactionId
      }
    })
  }

  /**
   * Handle booking confirmation messages
   */
  private async handleBookingConfirmation(message: PaymentNotificationMessage & { type: 'BOOKING_CONFIRMED' }): Promise<void> {
    const notification: PaymentNotification = {
      id: `booking_${message.bookingId}_${Date.now()}`,
      type: 'BOOKING_CONFIRMED',
      title: 'Booking confirmed!',
      message: `Your booking for ${message.propertyName} from ${message.checkIn} to ${message.checkOut} is confirmed.`,
      actionRequired: false,
      timestamp: new Date().toISOString()
    }

    this.options.onNotificationCreated(notification)

    // Send status update
    this.options.onStatusUpdate({
      type: 'booking',
      id: message.bookingId,
      status: 'CONFIRMED',
      data: {
        propertyName: message.propertyName,
        checkIn: message.checkIn,
        checkOut: message.checkOut
      }
    })
  }

  /**
   * Get auction result title
   */
  private getAuctionResultTitle(result: string): string {
    switch (result) {
      case 'FULL_WIN':
        return 'Congratulations! You won the auction!'
      case 'PARTIAL_WIN':
        return 'You won partial nights!'
      case 'LOST':
        return 'Auction ended'
      default:
        return 'Auction result'
    }
  }

  /**
   * Get auction result message
   */
  private getAuctionResultMessage(message: PaymentNotificationMessage & { type: 'AUCTION_RESULT' }): string {
    const baseMessage = `Property: ${message.propertyName}`
    
    if (message.result === 'PARTIAL_WIN' && message.awardedNights) {
      return `${baseMessage}. Awarded ${message.awardedNights.length} nights.`
    }
    
    return baseMessage
  }

  /**
   * Get payment status title
   */
  private getPaymentStatusTitle(status: string): string {
    switch (status) {
      case 'INITIATED':
        return 'Payment initiated'
      case 'PROCESSING':
        return 'Processing payment...'
      case 'COMPLETED':
        return 'Payment successful!'
      case 'FAILED':
        return 'Payment failed'
      default:
        return 'Payment update'
    }
  }

  /**
   * Get payment status message
   */
  private getPaymentStatusMessage(status: string, transactionId?: string): string {
    switch (status) {
      case 'INITIATED':
        return 'Your payment has been initiated. Please complete the payment process.'
      case 'PROCESSING':
        return 'Your payment is being processed. Please wait...'
      case 'COMPLETED':
        return `Payment completed successfully. ${transactionId ? `Transaction ID: ${transactionId}` : ''}`
      case 'FAILED':
        return 'Payment failed. Please try again or contact support.'
      default:
        return 'Payment status updated'
    }
  }

  /**
   * Clean up old processed messages
   */
  private cleanupOldMessages(): void {
    const now = Date.now()
    const maxAge = this.options.duplicateWindowMs * 2 // Keep messages for twice the deduplication window
    
    for (const [messageId, processedMessage] of this.processedMessages.entries()) {
      if (now - processedMessage.timestamp > maxAge) {
        this.processedMessages.delete(messageId)
      }
    }

    // Limit total number of stored messages
    if (this.processedMessages.size > this.options.maxMessageHistory) {
      const sortedMessages = Array.from(this.processedMessages.entries())
        .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      
      const toDelete = sortedMessages.slice(0, this.processedMessages.size - this.options.maxMessageHistory)
      toDelete.forEach(([messageId]) => {
        this.processedMessages.delete(messageId)
      })
    }
  }

  /**
   * Get processing statistics
   */
  getStats(): {
    processedCount: number
    queueLength: number
    oldestMessage: number | null
    newestMessage: number | null
  } {
    const timestamps = Array.from(this.processedMessages.values()).map(m => m.timestamp)
    
    return {
      processedCount: this.processedMessages.size,
      queueLength: this.messageQueue.length,
      oldestMessage: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestMessage: timestamps.length > 0 ? Math.max(...timestamps) : null
    }
  }

  /**
   * Clear all processed messages and queue
   */
  clear(): void {
    this.processedMessages.clear()
    this.messageQueue = []
  }

  /**
   * Destroy handler and clean up resources
   */
  destroy(): void {
    this.clear()
  }
}