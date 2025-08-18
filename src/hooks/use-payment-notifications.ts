/**
 * WebSocket hook for real-time payment notifications
 * Handles auction results, payment status updates, and second chance offers
 * Enhanced with message discrimination, routing, and deduplication
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { PaymentNotification } from '@/types/payment'
import { PaymentNotificationMessage } from '@/types/auction-winners'
import { WebSocketMessageRouter } from '@/lib/websocket/message-router'
import { WebSocketMessageDiscriminator } from '@/lib/websocket/message-discriminator'

interface UsePaymentNotificationsReturn {
  notifications: PaymentNotification[]
  connectionStatus: 'connecting' | 'connected' | 'disconnected'
  clearNotification: (id: string) => void
  markAsRead: (id: string) => void
  unreadCount: number
  stats: any
  forceReconnect: () => void
}

interface StatusUpdate {
  type: 'payment' | 'booking' | 'auction'
  id: string
  status: string
  data?: any
}

export const usePaymentNotifications = (userId: string): UsePaymentNotificationsReturn => {
  const [notifications, setNotifications] = useState<PaymentNotification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting')
  const [statusUpdates, setStatusUpdates] = useState<StatusUpdate[]>([])
  
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5
  const messageRouterRef = useRef<WebSocketMessageRouter | null>(null)
  const messageDiscriminatorRef = useRef<WebSocketMessageDiscriminator | null>(null)

  // Initialize message discriminator and router
  useEffect(() => {
    if (!userId) return

    messageDiscriminatorRef.current = new WebSocketMessageDiscriminator()
    messageRouterRef.current = new WebSocketMessageRouter({
      userId,
      onNotificationCreated: (notification: PaymentNotification) => {
        setNotifications(prev => [...prev, notification])
      },
      onStatusUpdate: (update: StatusUpdate) => {
        setStatusUpdates(prev => [...prev, update])
      },
      onError: (error: Error) => {
        console.error('WebSocket message router error:', error)
      }
    })

    return () => {
      messageRouterRef.current?.destroy()
      messageDiscriminatorRef.current = null
    }
  }, [userId])

  const connect = useCallback(() => {
    if (!userId || !messageRouterRef.current || !messageDiscriminatorRef.current) return

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080'}/payment-notifications`
    
    try {
      wsRef.current = new WebSocket(wsUrl)
      
      wsRef.current.onopen = () => {
        console.log('Payment notifications WebSocket connected')
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        
        // Subscribe to payment notifications
        wsRef.current?.send(JSON.stringify({
          type: 'SUBSCRIBE',
          userId,
          channels: ['auction_results', 'payment_status', 'second_chance_offers', 'booking_confirmations']
        }))
      }
      
      wsRef.current.onmessage = (event) => {
        try {
          const rawMessage = JSON.parse(event.data)
          
          // Discriminate and validate message
          const validationResult = messageDiscriminatorRef.current!.discriminateMessage(rawMessage)
          
          if (!validationResult.isValid) {
            console.warn('Invalid WebSocket message received:', validationResult.errors)
            return
          }

          if (validationResult.transformedMessage) {
            // Route message to appropriate handlers
            messageRouterRef.current!.routeMessage(validationResult.transformedMessage)
          }
        } catch (error) {
          console.error('Failed to process WebSocket message:', error)
        }
      }
      
      wsRef.current.onclose = () => {
        console.log('Payment notifications WebSocket disconnected')
        setConnectionStatus('disconnected')
        handleReconnection()
      }
      
      wsRef.current.onerror = (error) => {
        console.error('Payment notifications WebSocket error:', error)
        setConnectionStatus('disconnected')
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('disconnected')
      handleReconnection()
    }
  }, [userId])

  const handleReconnection = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++
      const delay = Math.pow(2, reconnectAttempts.current) * 1000 // Exponential backoff
      
      console.log(`Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current}/${maxReconnectAttempts})`)
      
      reconnectTimeoutRef.current = setTimeout(() => {
        connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
    }
  }, [connect])

  // Force reconnection function
  const forceReconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
    reconnectAttempts.current = 0
    setTimeout(() => connect(), 1000)
  }, [connect])

  // Get comprehensive stats
  const getStats = useCallback(() => {
    const routerStats = messageRouterRef.current?.getStats()
    const discriminatorStats = messageDiscriminatorRef.current?.getValidationStats()
    
    return {
      connection: {
        status: connectionStatus,
        reconnectAttempts: reconnectAttempts.current,
        maxReconnectAttempts
      },
      notifications: {
        total: notifications.length,
        unread: notifications.filter(n => n.actionRequired).length,
        byType: notifications.reduce((acc, n) => {
          acc[n.type] = (acc[n.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      statusUpdates: {
        total: statusUpdates.length,
        byType: statusUpdates.reduce((acc, u) => {
          acc[u.type] = (acc[u.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      },
      router: routerStats,
      discriminator: discriminatorStats
    }
  }, [connectionStatus, notifications, statusUpdates])

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, actionRequired: false } : n
    ))
  }, [])

  const unreadCount = notifications.filter(n => n.actionRequired).length

  // Initialize connection
  useEffect(() => {
    if (userId) {
      connect()
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [userId, connect])

  return {
    notifications,
    connectionStatus,
    clearNotification,
    markAsRead,
    unreadCount,
    stats: getStats(),
    forceReconnect
  }
}