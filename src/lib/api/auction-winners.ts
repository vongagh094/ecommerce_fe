/**
 * Auction Winner API Service
 * Handles API calls for auction winners, partial offers, and second chance offers
 */

import { apiClient } from './base'
import { WinningBid, SecondChanceOffer, AwardedNight } from '@/types/auction-winners'

export const auctionWinnerApi = {
  // Get user's winning bids
  getWinningBids: async (): Promise<WinningBid[]> => {
    return apiClient.get('/auctions/winners/me', { requireAuth: true })
  },

  // Get specific winning bid by ID
  getWinningBidById: async (auctionId: string): Promise<WinningBid> => {
    return apiClient.get(`/auctions/winners/${auctionId}`, { requireAuth: true })
  },

  // Accept full winning bid
  acceptWinningBid: async (auctionId: string): Promise<void> => {
    return apiClient.post(`/auctions/winners/${auctionId}/accept`, {}, { requireAuth: true })
  },

  // Decline full winning bid
  declineWinningBid: async (auctionId: string, reason?: string): Promise<void> => {
    return apiClient.post(`/auctions/winners/${auctionId}/decline`, { reason }, { requireAuth: true })
  },

  // Accept partial offer
  acceptPartialOffer: async (offerId: string, selectedNights: string[]): Promise<void> => {
    return apiClient.post(`/auctions/offers/${offerId}/accept`, { selectedNights }, { requireAuth: true })
  },

  // Decline partial offer
  declinePartialOffer: async (offerId: string, reason?: string): Promise<void> => {
    return apiClient.post(`/auctions/offers/${offerId}/decline`, { reason }, { requireAuth: true })
  },

  // Get second chance offers
  getSecondChanceOffers: async (): Promise<SecondChanceOffer[]> => {
    return apiClient.get('/auctions/offers/second-chance/me', { requireAuth: true })
  },

  // Get specific second chance offer
  getSecondChanceOfferById: async (offerId: string): Promise<SecondChanceOffer> => {
    return apiClient.get(`/auctions/offers/second-chance/${offerId}`, { requireAuth: true })
  },

  // Accept second chance offer
  acceptSecondChanceOffer: async (offerId: string): Promise<void> => {
    return apiClient.post(`/auctions/offers/second-chance/${offerId}/accept`, {}, { requireAuth: true })
  },

  // Decline second chance offer
  declineSecondChanceOffer: async (offerId: string, reason?: string): Promise<void> => {
    return apiClient.post(`/auctions/offers/second-chance/${offerId}/decline`, { reason }, { requireAuth: true })
  },

  // Track offer decline reason
  trackDeclineReason: async (offerId: string, reason: string, type: 'full' | 'partial' | 'second_chance'): Promise<void> => {
    return apiClient.post('/auctions/analytics/decline', { offerId, reason, type }, { requireAuth: true })
  }
}

// Utility functions for winner data management
export const winnerUtils = {
  // Calculate total nights between two dates
  calculateTotalNights: (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  },

  // Format date range for display
  formatDateRange: (startDate: string, endDate: string): string => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    // If same day, just return one date
    if (startDate === endDate) {
      return start.toLocaleDateString()
    }
    
    return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
  },

  // Group consecutive nights
  groupConsecutiveNights: (nights: string[]): { start: string, end: string, nights: string[] }[] => {
    if (!nights || nights.length === 0) return []
    
    const sortedNights = [...nights].sort()
    const ranges = []
    let currentRange = { 
      start: sortedNights[0], 
      end: sortedNights[0],
      nights: [sortedNights[0]]
    }
    
    for (let i = 1; i < sortedNights.length; i++) {
      const currentDate = new Date(sortedNights[i])
      const prevDate = new Date(sortedNights[i-1])
      
      // Check if dates are consecutive
      prevDate.setDate(prevDate.getDate() + 1)
      if (currentDate.toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) {
        currentRange.end = sortedNights[i]
        currentRange.nights.push(sortedNights[i])
      } else {
        ranges.push({ ...currentRange })
        currentRange = { 
          start: sortedNights[i], 
          end: sortedNights[i],
          nights: [sortedNights[i]]
        }
      }
    }
    
    ranges.push(currentRange)
    return ranges
  },

  // Group consecutive nights with detailed information
  groupConsecutiveNightsWithDetails: (nights: AwardedNight[]): { 
    rangeId: string, 
    nights: AwardedNight[], 
    startDate: string, 
    endDate: string,
    totalAmount: number
  }[] => {
    if (!nights || nights.length === 0) return []
    
    // Sort nights by date
    const sortedNights = [...nights].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    const ranges = []
    let currentRange = { 
      rangeId: `range-${Date.now()}-0`,
      startDate: sortedNights[0].date, 
      endDate: sortedNights[0].date,
      nights: [sortedNights[0]],
      totalAmount: sortedNights[0].pricePerNight
    }
    
    for (let i = 1; i < sortedNights.length; i++) {
      const currentDate = new Date(sortedNights[i].date)
      const prevDate = new Date(sortedNights[i-1].date)
      
      // Check if dates are consecutive
      prevDate.setDate(prevDate.getDate() + 1)
      if (currentDate.toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) {
        currentRange.endDate = sortedNights[i].date
        currentRange.nights.push(sortedNights[i])
        currentRange.totalAmount += sortedNights[i].pricePerNight
      } else {
        ranges.push({ ...currentRange })
        currentRange = { 
          rangeId: `range-${Date.now()}-${i}`,
          startDate: sortedNights[i].date, 
          endDate: sortedNights[i].date,
          nights: [sortedNights[i]],
          totalAmount: sortedNights[i].pricePerNight
        }
      }
    }
    
    ranges.push(currentRange)
    return ranges
  },

  // Check if payment is pending
  hasPendingPayment: (winningBid: WinningBid): boolean => {
    return winningBid.status === 'PENDING_PAYMENT'
  },

  // Check if payment deadline has expired
  isPaymentExpired: (deadline: string): boolean => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    return now > deadlineDate
  },

  // Get formatted time remaining until payment deadline
  getPaymentTimeRemaining: (deadline: string): string => {
    const deadlineDate = new Date(deadline)
    const now = new Date()
    
    if (now > deadlineDate) {
      return "Expired"
    }
    
    const diffMs = deadlineDate.getTime() - now.getTime()
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diffHrs > 24) {
      const days = Math.floor(diffHrs / 24)
      return `${days} day${days > 1 ? 's' : ''} left`
    }
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m left`
    }
    
    return `${diffMins} min left`
  }
}