/**
 * WebSocket message router
 * Routes messages to appropriate handlers based on type and context
 */

import { PaymentNotificationMessage } from '@/types/auction-winners'
import { PaymentNotification } from '@/types/payment'
import { WebSocketMessageHandler } from './message-handler'

interface MessageRouterOptions {
  userId: string
  onNotificationCreated: (notification: PaymentNotification) => void
  onStatusUpdate: (update: StatusUpdate) => void
  onError: (error: Error) => void
}

interface StatusUpdate {
  type: 'payment' | 'booking' | 'auction'
  id: string
  status: string
  data?: any
}

interface RouteConfig {
  messageTypes: string[]
  handler: (message: PaymentNotificationMessage) => Promise<void>
  priority: number
}

export class WebSocketMessageRouter {
  private messageHandler: WebSocketMessageHandler
  private routes = new Map<string, RouteConfig>()
  private options: MessageRouterOptions
  private messageStats = {
    total: 0,
    byType: new Map<string, number>(),
    errors: 0
  }

  constructor(options: MessageRouterOptions) {
    this.options = options
    
    // Initialize message handler
    this.messageHandler = new WebSocketMessageHandler({
      maxMessageHistory: 1000,
      duplicateWindowMs: 30000, // 30 seconds
      onNotificationCreated: options.onNotificationCreated,
      onStatusUpdate: options.onStatusUpdate
    })

    // Setup default routes
    this.setupDefaultRoutes()
  }

  /**
   * Setup default message routes
   */
  private setupDefaultRoutes(): void {
    // Auction result route
    this.addRoute('auction_results', {
      messageTypes: ['AUCTION_RESULT'],
      handler: this.handleAuctionMessage.bind(this),
      priority: 1
    })

    // Payment status route
    this.addRoute('payment_status', {
      messageTypes: ['PAYMENT_STATUS'],
      handler: this.handlePaymentMessage.bind(this),
      priority: 2
    })

    // Second chance offer route
    this.addRoute('second_chance', {
      messageTypes: ['SECOND_CHANCE_OFFER'],
      handler: this.handleSecondChanceMessage.bind(this),
      priority: 1
    })

    // Booking confirmation route
    this.addRoute('booking_confirmation', {
      messageTypes: ['BOOKING_CONFIRMED'],
      handler: this.handleBookingMessage.bind(this),
      priority: 3
    })
  }

  /**
   * Add a new message route
   */
  addRoute(routeName: string, config: RouteConfig): void {
    this.routes.set(routeName, config)
  }

  /**
   * Remove a message route
   */
  removeRoute(routeName: string): void {
    this.routes.delete(routeName)
  }

  /**
   * Route incoming message to appropriate handler
   */
  async routeMessage(message: PaymentNotificationMessage): Promise<void> {
    try {
      // Update statistics
      this.messageStats.total++
      const currentCount = this.messageStats.byType.get(message.type) || 0
      this.messageStats.byType.set(message.type, currentCount + 1)

      // Validate message for current user
      if (!this.isMessageForUser(message)) {
        console.log('WebSocketMessageRouter: Message not for current user, ignoring')
        return
      }

      // Find matching routes
      const matchingRoutes = this.findMatchingRoutes(message.type)
      
      if (matchingRoutes.length === 0) {
        console.warn('WebSocketMessageRouter: No routes found for message type:', message.type)
        return
      }

      // Sort routes by priority (lower number = higher priority)
      matchingRoutes.sort((a, b) => a.priority - b.priority)

      // Process message through main handler first
      this.messageHandler.processMessage(message)

      // Then process through custom routes
      for (const route of matchingRoutes) {
        try {
          await route.handler(message)
        } catch (error) {
          console.error('WebSocketMessageRouter: Route handler error:', error)
          this.messageStats.errors++
          this.options.onError(error as Error)
        }
      }

    } catch (error) {
      console.error('WebSocketMessageRouter: Error routing message:', error)
      this.messageStats.errors++
      this.options.onError(error as Error)
    }
  }

  /**
   * Check if message is intended for current user
   */
  private isMessageForUser(message: PaymentNotificationMessage): boolean {
    return message.userId === this.options.userId
  }

  /**
   * Find routes that match the message type
   */
  private findMatchingRoutes(messageType: string): RouteConfig[] {
    const matchingRoutes: RouteConfig[] = []
    
    for (const route of this.routes.values()) {
      if (route.messageTypes.includes(messageType)) {
        matchingRoutes.push(route)
      }
    }
    
    return matchingRoutes
  }

  /**
   * Handle auction-related messages
   */
  private async handleAuctionMessage(message: PaymentNotificationMessage): Promise<void> {
    if (message.type !== 'AUCTION_RESULT') return

    console.log('WebSocketMessageRouter: Processing auction result:', {
      auctionId: message.auctionId,
      result: message.result,
      amount: message.amount
    })

    // Additional auction-specific processing can be added here
    // For example: updating local auction state, triggering analytics events, etc.
  }

  /**
   * Handle payment-related messages
   */
  private async handlePaymentMessage(message: PaymentNotificationMessage): Promise<void> {
    if (message.type !== 'PAYMENT_STATUS') return

    console.log('WebSocketMessageRouter: Processing payment status:', {
      paymentId: message.paymentId,
      status: message.status,
      transactionId: message.transactionId
    })

    // Additional payment-specific processing can be added here
    // For example: updating payment UI state, triggering payment analytics, etc.
  }

  /**
   * Handle second chance offer messages
   */
  private async handleSecondChanceMessage(message: PaymentNotificationMessage): Promise<void> {
    if (message.type !== 'SECOND_CHANCE_OFFER') return

    console.log('WebSocketMessageRouter: Processing second chance offer:', {
      offerId: message.offerId,
      auctionId: message.auctionId,
      amount: message.amount,
      responseDeadline: message.responseDeadline
    })

    // Additional second chance offer processing can be added here
    // For example: setting up countdown timers, triggering offer analytics, etc.
  }

  /**
   * Handle booking confirmation messages
   */
  private async handleBookingMessage(message: PaymentNotificationMessage): Promise<void> {
    if (message.type !== 'BOOKING_CONFIRMED') return

    console.log('WebSocketMessageRouter: Processing booking confirmation:', {
      bookingId: message.bookingId,
      propertyName: message.propertyName,
      checkIn: message.checkIn,
      checkOut: message.checkOut
    })

    // Additional booking-specific processing can be added here
    // For example: updating booking state, triggering confirmation emails, etc.
  }

  /**
   * Get message routing statistics
   */
  getStats(): {
    totalMessages: number
    messagesByType: Record<string, number>
    errorCount: number
    routeCount: number
    handlerStats: any
  } {
    return {
      totalMessages: this.messageStats.total,
      messagesByType: Object.fromEntries(this.messageStats.byType),
      errorCount: this.messageStats.errors,
      routeCount: this.routes.size,
      handlerStats: this.messageHandler.getStats()
    }
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.messageStats = {
      total: 0,
      byType: new Map<string, number>(),
      errors: 0
    }
    this.messageHandler.clear()
  }

  /**
   * Destroy router and clean up resources
   */
  destroy(): void {
    this.routes.clear()
    this.messageHandler.destroy()
    this.resetStats()
  }
}