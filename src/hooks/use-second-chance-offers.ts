"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SecondChanceOffer } from '@/types/auction-winners'
import { auctionWinnerApi } from '@/lib/api/auction-winners'
import { useToast } from '@/hooks/use-toast'

export function useSecondChanceOffers() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [offers, setOffers] = useState<SecondChanceOffer[]>([])
  const [currentOffer, setCurrentOffer] = useState<SecondChanceOffer | null>(null)
  const [property, setProperty] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch all second chance offers
  const fetchOffers = useCallback(async () => {
    try {
      setIsLoading(true)
      const fetchedOffers = await auctionWinnerApi.getSecondChanceOffers()
      
      // Filter for active offers only
      const activeOffers = fetchedOffers.filter(offer => offer.status === 'WAITING')
      setOffers(activeOffers)
      
      // If there's an active offer, show it
      if (activeOffers.length > 0) {
        await showOffer(activeOffers[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch second chance offers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load second chance offers',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Show a specific offer
  const showOffer = useCallback(async (offerId: string) => {
    try {
      setIsLoading(true)
      
      // Get offer details
      const offer = await auctionWinnerApi.getSecondChanceOfferById(offerId)
      setCurrentOffer(offer)
      
      // Fetch property details
      // In a real implementation, you'd call an API to get property details
      // For now, we'll simulate it with a placeholder
      const mockProperty = {
        id: 'property-123',
        title: 'Beach House',
        location: {
          city: 'Miami',
          state: 'FL'
        },
        images: [
          {
            image_url: '/placeholder.jpg'
          }
        ]
      }
      setProperty(mockProperty)
      
      // Open the modal
      setIsModalOpen(true)
    } catch (error) {
      console.error(`Failed to fetch offer details for ${offerId}:`, error)
      toast({
        title: 'Error',
        description: 'Failed to load offer details',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  // Accept an offer
  const acceptOffer = useCallback(async () => {
    if (!currentOffer) return
    
    try {
      setIsProcessing(true)
      
      // Accept the offer
      await auctionWinnerApi.acceptSecondChanceOffer(currentOffer.id)
      
      toast({
        title: 'Offer Accepted',
        description: 'You have successfully accepted the offer. Proceeding to payment.',
        variant: 'default'
      })
      
      // Close the modal
      setIsModalOpen(false)
      
      // Navigate to payment page
      router.push(`/dashboard/winners/${currentOffer.auctionId}`)
    } catch (error) {
      console.error(`Failed to accept offer ${currentOffer.id}:`, error)
      toast({
        title: 'Error',
        description: 'Failed to accept the offer. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [currentOffer, router, toast])

  // Decline an offer
  const declineOffer = useCallback(async (reason?: string) => {
    if (!currentOffer) return
    
    try {
      setIsProcessing(true)
      
      // Decline the offer
      await auctionWinnerApi.declineSecondChanceOffer(currentOffer.id, reason)
      
      // Track decline reason if provided
      if (reason) {
        await auctionWinnerApi.trackDeclineReason(currentOffer.id, reason, 'second_chance')
      }
      
      toast({
        title: 'Offer Declined',
        description: 'You have declined the offer.',
        variant: 'default'
      })
      
      // Close the modal
      setIsModalOpen(false)
      
      // Remove the declined offer from the list
      setOffers(prev => prev.filter(o => o.id !== currentOffer.id))
      setCurrentOffer(null)
    } catch (error) {
      console.error(`Failed to decline offer ${currentOffer.id}:`, error)
      toast({
        title: 'Error',
        description: 'Failed to decline the offer. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsProcessing(false)
    }
  }, [currentOffer, toast])

  // Check for new offers on component mount
  useEffect(() => {
    fetchOffers()
    
    // Poll for new offers every 30 seconds
    const interval = setInterval(fetchOffers, 30000)
    
    return () => clearInterval(interval)
  }, [fetchOffers])

  return {
    offers,
    currentOffer,
    property,
    isLoading,
    isModalOpen,
    isProcessing,
    setIsModalOpen,
    showOffer,
    acceptOffer,
    declineOffer
  }
} 