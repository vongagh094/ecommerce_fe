/**
 * WebSocket handler for payment notifications
 * Manages connection lifecycle and message routing
 */

import { PaymentNotificationMessage } from '@/types/auction-winners'

export class PaymentWebSocketHandler {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectTimeout: NodeJS.Timeout | null = null
  private userId: string | null = null
  private onMessageCallback: ((message: PaymentNotificationMessage) => void) | null = null

  constructor() {
    this.handleVisibilityChange = this.handleVisibilityChange.bind(this)
    this.handleOnline = this.handleOnline.bind(this)
    this.handleOffline = this.handleOffline.bind(this)
  }

  /**
   * Connect to WebSocket server
   */
  connect(userId: string, onMessage: (message: PaymentNotificationMessage) => void): void {
    this.userId = userId
    this.onMessageCallback = onMessage

    if (!userId) {
      console.warn('Cannot connect WebSocket without userId')
      return
    }

    const base = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'
    const path = (process.env.NEXT_PUBLIC_WS_PATH ?? '/payment-notifications')
    const wsUrl = `${base}${path}`
    
    try {
      this.ws = new WebSocket(wsUrl)
      
      this.ws.onopen = () => {
        console.log('PaymentWebSocketHandler: Connected')
        this.reconnectAttempts = 0
        this.subscribe(userId)
        this.setupBrowserEventListeners()
      }
      
      this.ws.onmessage = (event) => {
        try {
          const message: PaymentNotificationMessage = JSON.parse(event.data)
          this.onMessageCallback?.(message)
        } catch (error) {
          console.error('PaymentWebSocketHandler: Failed to parse message:', error)
        }
      }
      
      this.ws.onclose = (event) => {
        console.log('PaymentWebSocketHandler: Connection closed', event.code, event.reason)
        this.handleReconnection()
      }
      
      this.ws.onerror = (error) => {
        console.error('PaymentWebSocketHandler: Connection error:', error)
      }
    } catch (error) {
      console.error('PaymentWebSocketHandler: Failed to create connection:', error)
      this.handleReconnection()
    }
  }

  /**
   * Subscribe to payment notification channels
   */
  private subscribe(userId: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      const subscribeMessage = {
        type: 'SUBSCRIBE',
        userId,
        channels: [
          'auction_results',
          'payment_status', 
          'second_chance_offers',
          'booking_confirmations'
        ]
      }
      
      this.ws.send(JSON.stringify(subscribeMessage))
      console.log('PaymentWebSocketHandler: Subscribed to channels')
    }
  }

  /**
   * Handle reconnection with exponential backoff
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.userId) {
      this.reconnectAttempts++
      const delay = Math.min(Math.pow(2, this.reconnectAttempts) * 1000, 30000) // Max 30s delay
      
      console.log(`PaymentWebSocketHandler: Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
      
      this.reconnectTimeout = setTimeout(() => {
        if (this.userId && this.onMessageCallback) {
          this.connect(this.userId, this.onMessageCallback)
        }
      }, delay)
    } else {
      console.error('PaymentWebSocketHandler: Max reconnection attempts reached')
    }
  }

  /**
   * Setup browser event listeners for connection management
   */
  private setupBrowserEventListeners(): void {
    if (typeof window !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange)
      window.addEventListener('online', this.handleOnline)
      window.addEventListener('offline', this.handleOffline)
    }
  }

  /**
   * Remove browser event listeners
   */
  private removeBrowserEventListeners(): void {
    if (typeof window !== 'undefined') {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      window.removeEventListener('online', this.handleOnline)
      window.removeEventListener('offline', this.handleOffline)
    }
  }

  /**
   * Handle page visibility changes
   */
  private handleVisibilityChange(): void {
    if (document.visibilityState === 'visible' && this.ws?.readyState !== WebSocket.OPEN) {
      // Page became visible and connection is not open, try to reconnect
      if (this.userId && this.onMessageCallback) {
        this.connect(this.userId, this.onMessageCallback)
      }
    }
  }

  /**
   * Handle browser coming online
   */
  private handleOnline(): void {
    console.log('PaymentWebSocketHandler: Browser came online')
    if (this.ws?.readyState !== WebSocket.OPEN && this.userId && this.onMessageCallback) {
      this.connect(this.userId, this.onMessageCallback)
    }
  }

  /**
   * Handle browser going offline
   */
  private handleOffline(): void {
    console.log('PaymentWebSocketHandler: Browser went offline')
  }

  /**
   * Send message to server
   */
  sendMessage(message: any): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message))
    } else {
      console.warn('PaymentWebSocketHandler: Cannot send message, connection not open')
    }
  }

  /**
   * Dev-only: emit a local message directly to the onMessage callback
   */
  emitLocal(message: PaymentNotificationMessage): void {
    if (process.env.NEXT_PUBLIC_PAYMENT_MOCK !== '1') {
      console.warn('emitLocal is only available in mock mode')
      return
    }
    if (!this.onMessageCallback) {
      console.warn('emitLocal: no onMessage callback registered')
      return
    }
    try {
      this.onMessageCallback(message)
    } catch (err) {
      console.error('emitLocal failed:', err)
    }
  }

  /**
   * Get current connection status
   */
  getConnectionStatus(): 'connecting' | 'connected' | 'disconnected' {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      default:
        return 'disconnected'
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    console.log('PaymentWebSocketHandler: Disconnecting')
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }
    
    this.removeBrowserEventListeners()
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect')
      this.ws = null
    }
    
    this.userId = null
    this.onMessageCallback = null
    this.reconnectAttempts = 0
  }

  /**
   * Force reconnection (useful for testing or manual recovery)
   */
  forceReconnect(): void {
    if (this.userId && this.onMessageCallback) {
      this.disconnect()
      setTimeout(() => {
        if (this.userId && this.onMessageCallback) {
          this.connect(this.userId, this.onMessageCallback)
        }
      }, 1000)
    }
  }
}

// Singleton instance for global use
export const paymentWebSocketHandler = new PaymentWebSocketHandler()