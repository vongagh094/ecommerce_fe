/**
 * Payment Session Management Utilities
 * Handles payment session lifecycle, validation, and state management
 */

import { PaymentSession, PaymentStatus, PaymentError } from '@/types/payment'

/**
 * Payment session configuration
 */
export interface PaymentSessionConfig {
  timeoutMinutes: number
  cleanupIntervalMinutes: number
  maxActiveSessions: number
  enablePersistence: boolean
}

/**
 * Session storage interface
 */
export interface SessionStorage {
  get(sessionId: string): Promise<PaymentSession | null>
  set(sessionId: string, session: PaymentSession): Promise<void>
  delete(sessionId: string): Promise<void>
  list(userId?: string): Promise<PaymentSession[]>
  cleanup(): Promise<number>
}

/**
 * In-memory session storage implementation
 */
export class MemorySessionStorage implements SessionStorage {
  private sessions = new Map<string, PaymentSession>()

  async get(sessionId: string): Promise<PaymentSession | null> {
    return this.sessions.get(sessionId) || null
  }

  async set(sessionId: string, session: PaymentSession): Promise<void> {
    this.sessions.set(sessionId, session)
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId)
  }

  async list(userId?: string): Promise<PaymentSession[]> {
    const sessions = Array.from(this.sessions.values())
    return userId ? sessions.filter(s => s.userId === userId) : sessions
  }

  async cleanup(): Promise<number> {
    const now = new Date()
    let cleanedCount = 0
    
    this.sessions.forEach((session, sessionId) => {
      if (new Date(session.expiresAt) < now) {
        this.sessions.delete(sessionId)
        cleanedCount++
      }
    })
    
    return cleanedCount
  }

  clear(): void {
    this.sessions.clear()
  }

  size(): number {
    return this.sessions.size
  }
}

/**
 * Payment session manager
 */
export class PaymentSessionManager {
  private config: PaymentSessionConfig
  private storage: SessionStorage
  private cleanupTimer?: NodeJS.Timeout

  constructor(
    storage: SessionStorage,
    config: Partial<PaymentSessionConfig> = {}
  ) {
    this.storage = storage
    this.config = {
      timeoutMinutes: 15,
      cleanupIntervalMinutes: 5,
      maxActiveSessions: 100,
      enablePersistence: true,
      ...config
    }

    // Start cleanup timer
    this.startCleanupTimer()
  }

  /**
   * Create a new payment session
   */
  async createSession(params: {
    auctionId: string
    userId: string
    amount: number
    appTransId: string
    orderUrl?: string
  }): Promise<PaymentSession> {
    const { auctionId, userId, amount, appTransId, orderUrl } = params

    // Validate inputs
    if (!auctionId || !userId || !appTransId) {
      throw new PaymentError(
        'INVALID_SESSION_DATA',
        'Missing required session data'
      )
    }

    if (amount <= 0) {
      throw new PaymentError(
        'INVALID_AMOUNT',
        'Session amount must be greater than 0'
      )
    }

    // Check session limits
    await this.checkSessionLimits(userId)

    // Generate session
    const sessionId = this.generateSessionId()
    const now = new Date()
    const expiresAt = new Date(now.getTime() + this.config.timeoutMinutes * 60 * 1000)

    const session: PaymentSession = {
      id: sessionId,
      auctionId,
      userId,
      amount,
      currency: 'VND',
      status: 'CREATED',
      appTransId,
      orderUrl,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString()
    }

    // Store session
    await this.storage.set(sessionId, session)

    return session
  }

  /**
   * Get payment session by ID
   */
  async getSession(sessionId: string): Promise<PaymentSession | null> {
    if (!sessionId) {
      return null
    }

    const session = await this.storage.get(sessionId)
    
    if (!session) {
      return null
    }

    // Check if session is expired
    if (this.isSessionExpired(session)) {
      await this.storage.delete(sessionId)
      return null
    }

    return session
  }

  /**
   * Update session status
   */
  async updateSessionStatus(
    sessionId: string,
    status: PaymentStatus,
    orderUrl?: string
  ): Promise<PaymentSession> {
    const session = await this.getSession(sessionId)
    
    if (!session) {
      throw new PaymentError(
        'SESSION_NOT_FOUND',
        'Payment session not found'
      )
    }

    // Validate status transition
    this.validateStatusTransition(session.status, status)

    const updatedSession: PaymentSession = {
      ...session,
      status,
      ...(orderUrl && { orderUrl })
    }

    await this.storage.set(sessionId, updatedSession)
    return updatedSession
  }

  /**
   * Cancel payment session
   */
  async cancelSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId)
    
    if (!session) {
      throw new PaymentError(
        'SESSION_NOT_FOUND',
        'Payment session not found'
      )
    }

    // Only allow cancellation of certain statuses
    if (!['CREATED', 'PENDING'].includes(session.status)) {
      throw new PaymentError(
        'INVALID_SESSION_STATUS',
        `Cannot cancel session with status: ${session.status}`
      )
    }

    await this.updateSessionStatus(sessionId, 'CANCELLED')
  }

  /**
   * Get user's active sessions
   */
  async getUserSessions(
    userId: string,
    includeExpired: boolean = false
  ): Promise<PaymentSession[]> {
    const allSessions = await this.storage.list(userId)
    
    if (includeExpired) {
      return allSessions
    }

    return allSessions.filter(session => !this.isSessionExpired(session))
  }

  /**
   * Get session by app_trans_id
   */
  async getSessionByAppTransId(appTransId: string): Promise<PaymentSession | null> {
    const allSessions = await this.storage.list()
    return allSessions.find(session => session.appTransId === appTransId) || null
  }

  /**
   * Check if session is expired
   */
  isSessionExpired(session: PaymentSession): boolean {
    return new Date() > new Date(session.expiresAt)
  }

  /**
   * Check if session is valid for payment
   */
  isSessionValidForPayment(session: PaymentSession): { isValid: boolean; error?: string } {
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

    if (session.status === 'EXPIRED') {
      return { isValid: false, error: 'Payment session has expired' }
    }

    return { isValid: true }
  }

  /**
   * Get remaining time for session in milliseconds
   */
  getRemainingTime(session: PaymentSession): number {
    const now = new Date().getTime()
    const expiresAt = new Date(session.expiresAt).getTime()
    return Math.max(0, expiresAt - now)
  }

  /**
   * Format remaining time for display
   */
  formatRemainingTime(session: PaymentSession): string {
    const remainingMs = this.getRemainingTime(session)
    
    if (remainingMs <= 0) {
      return 'Expired'
    }
    
    const minutes = Math.floor(remainingMs / (1000 * 60))
    const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000)
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }
    
    return `${seconds}s`
  }

  /**
   * Get session progress percentage (0-100)
   */
  getSessionProgress(session: PaymentSession): number {
    const totalTime = new Date(session.expiresAt).getTime() - new Date(session.createdAt).getTime()
    const remainingTime = this.getRemainingTime(session)
    const elapsedTime = totalTime - remainingTime
    
    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100))
  }

  /**
   * Clean up expired sessions
   */
  async cleanupExpiredSessions(): Promise<number> {
    return await this.storage.cleanup()
  }

  /**
   * Get session statistics
   */
  async getSessionStats(): Promise<{
    total: number
    active: number
    expired: number
    byStatus: Record<PaymentStatus, number>
  }> {
    const allSessions = await this.storage.list()
    const now = new Date()
    
    const stats = {
      total: allSessions.length,
      active: 0,
      expired: 0,
      byStatus: {
        CREATED: 0,
        PENDING: 0,
        PAID: 0,
        FAILED: 0,
        CANCELLED: 0,
        EXPIRED: 0
      } as Record<PaymentStatus, number>
    }

    for (const session of allSessions) {
      const isExpired = new Date(session.expiresAt) < now
      
      if (isExpired) {
        stats.expired++
      } else {
        stats.active++
      }
      
      stats.byStatus[session.status]++
    }

    return stats
  }

  /**
   * Destroy session manager and cleanup
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
      this.cleanupTimer = undefined
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `session_${timestamp}_${random}`
  }

  /**
   * Check session limits for user
   */
  private async checkSessionLimits(userId: string): Promise<void> {
    const userSessions = await this.getUserSessions(userId)
    const activeSessions = userSessions.filter(s => 
      ['CREATED', 'PENDING'].includes(s.status)
    )

    if (activeSessions.length >= 5) { // Max 5 active sessions per user
      throw new PaymentError(
        'TOO_MANY_ACTIVE_SESSIONS',
        'Too many active payment sessions. Please complete or cancel existing payments.'
      )
    }

    // Check global session limit
    const allSessions = await this.storage.list()
    if (allSessions.length >= this.config.maxActiveSessions) {
      throw new PaymentError(
        'SESSION_LIMIT_EXCEEDED',
        'System is at maximum capacity. Please try again later.'
      )
    }
  }

  /**
   * Validate status transition
   */
  private validateStatusTransition(currentStatus: PaymentStatus, newStatus: PaymentStatus): void {
    const validTransitions: Record<PaymentStatus, PaymentStatus[]> = {
      CREATED: ['PENDING', 'CANCELLED', 'EXPIRED'],
      PENDING: ['PAID', 'FAILED', 'CANCELLED', 'EXPIRED'],
      PAID: [], // Terminal state
      FAILED: ['PENDING'], // Allow retry
      CANCELLED: [], // Terminal state
      EXPIRED: [] // Terminal state
    }

    const allowedTransitions = validTransitions[currentStatus] || []
    
    if (!allowedTransitions.includes(newStatus)) {
      throw new PaymentError(
        'INVALID_STATUS_TRANSITION',
        `Cannot transition from ${currentStatus} to ${newStatus}`
      )
    }
  }

  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer)
    }

    const intervalMs = this.config.cleanupIntervalMinutes * 60 * 1000
    
    this.cleanupTimer = setInterval(async () => {
      try {
        const cleanedCount = await this.cleanupExpiredSessions()
        if (cleanedCount > 0 && process.env.NODE_ENV === 'development') {
          console.log(`[PaymentSessionManager] Cleaned up ${cleanedCount} expired sessions`)
        }
      } catch (error) {
        console.error('[PaymentSessionManager] Cleanup error:', error)
      }
    }, intervalMs)
  }
}

/**
 * Session validation utilities
 */
export class SessionValidator {
  /**
   * Validate session data
   */
  static validateSessionData(data: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.auctionId || typeof data.auctionId !== 'string') {
      errors.push('Auction ID is required and must be a string')
    }

    if (!data.userId || typeof data.userId !== 'string') {
      errors.push('User ID is required and must be a string')
    }

    if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
      errors.push('Amount is required and must be a positive number')
    }

    if (!data.appTransId || typeof data.appTransId !== 'string') {
      errors.push('App transaction ID is required and must be a string')
    }

    if (data.orderUrl && typeof data.orderUrl !== 'string') {
      errors.push('Order URL must be a string if provided')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Validate session for payment processing
   */
  static validateForPayment(session: PaymentSession): { isValid: boolean; error?: string } {
    // Check expiration
    if (new Date() > new Date(session.expiresAt)) {
      return { isValid: false, error: 'Session has expired' }
    }

    // Check status
    if (!['CREATED', 'PENDING'].includes(session.status)) {
      return { isValid: false, error: `Invalid session status: ${session.status}` }
    }

    // Check amount
    if (session.amount <= 0) {
      return { isValid: false, error: 'Invalid session amount' }
    }

    // Check required fields
    if (!session.appTransId) {
      return { isValid: false, error: 'Missing app transaction ID' }
    }

    return { isValid: true }
  }

  /**
   * Validate session ownership
   */
  static validateOwnership(session: PaymentSession, userId: string): boolean {
    return session.userId === userId
  }
}

/**
 * Default session manager instance
 */
let defaultSessionManager: PaymentSessionManager | null = null

/**
 * Get default session manager instance
 */
export function getSessionManager(): PaymentSessionManager {
  if (!defaultSessionManager) {
    const storage = new MemorySessionStorage()
    defaultSessionManager = new PaymentSessionManager(storage)
  }
  return defaultSessionManager
}

/**
 * Initialize session manager with custom configuration
 */
export function initializeSessionManager(
  storage?: SessionStorage,
  config?: Partial<PaymentSessionConfig>
): PaymentSessionManager {
  if (defaultSessionManager) {
    defaultSessionManager.destroy()
  }
  
  const sessionStorage = storage || new MemorySessionStorage()
  defaultSessionManager = new PaymentSessionManager(sessionStorage, config)
  
  return defaultSessionManager
}