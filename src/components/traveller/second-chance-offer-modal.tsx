"use client"

import { useState, useEffect } from "react"
import { Clock, Trophy, Calendar, MapPin, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { SecondChanceOffer } from "@/types/auction-winners"
import { paymentUtils } from "@/lib/api/payment"

interface SecondChanceOfferModalProps {
  offer: SecondChanceOffer
  property: any
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onAccept: () => void
  onDecline: () => void
}

export function SecondChanceOfferModal({
  offer,
  property,
  isOpen,
  onOpenChange,
  onAccept,
  onDecline
}: SecondChanceOfferModalProps) {
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number }>({ minutes: 0, seconds: 0 })
  const [isExpired, setIsExpired] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Calculate time remaining
  useEffect(() => {
    if (!isOpen) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const deadline = new Date(offer.responseDeadline).getTime()
      const difference = deadline - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft({ minutes: 0, seconds: 0 })
        return
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60)
      const seconds = Math.floor((difference / 1000) % 60)
      setTimeLeft({ minutes, seconds })
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [isOpen, offer.responseDeadline])

  // Auto-decline when time expires
  useEffect(() => {
    if (isExpired && !isProcessing) {
      handleDecline()
    }
  }, [isExpired])

  const handleAccept = async () => {
    if (isExpired || isProcessing) return
    
    setIsProcessing(true)
    try {
      await onAccept()
    } catch (error) {
      console.error("Failed to accept offer:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (isProcessing) return
    
    setIsProcessing(true)
    try {
      await onDecline()
    } catch (error) {
      console.error("Failed to decline offer:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  // Format the offered nights into ranges
  const formatOfferedNights = () => {
    if (!offer.offeredNights || offer.offeredNights.length === 0) {
      return "No nights available"
    }

    // Sort dates
    const sortedDates = [...offer.offeredNights].sort()
    
    // Group consecutive dates
    const ranges = []
    let currentRange = { start: sortedDates[0], end: sortedDates[0] }
    
    for (let i = 1; i < sortedDates.length; i++) {
      const currentDate = new Date(sortedDates[i])
      const prevDate = new Date(sortedDates[i-1])
      
      // Check if dates are consecutive
      prevDate.setDate(prevDate.getDate() + 1)
      if (currentDate.toISOString().split('T')[0] === prevDate.toISOString().split('T')[0]) {
        currentRange.end = sortedDates[i]
      } else {
        ranges.push({ ...currentRange })
        currentRange = { start: sortedDates[i], end: sortedDates[i] }
      }
    }
    
    ranges.push(currentRange)
    
    // Format ranges
    return ranges.map(range => {
      if (range.start === range.end) {
        return new Date(range.start).toLocaleDateString()
      }
      return `${new Date(range.start).toLocaleDateString()} - ${new Date(range.end).toLocaleDateString()}`
    }).join(", ")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <Trophy className="h-5 w-5 text-amber-500 mr-2" />
            Second Chance Offer!
          </DialogTitle>
          <DialogDescription className="text-amber-700">
            You have a limited-time opportunity to book nights that just became available.
          </DialogDescription>
        </DialogHeader>

        {/* Countdown Timer */}
        <div className={`flex items-center justify-center p-3 rounded-lg ${
          isExpired ? 'bg-red-50 text-red-800' : 'bg-amber-50 text-amber-800'
        }`}>
          <Clock className="h-5 w-5 mr-2" />
          <span className="font-medium">
            {isExpired ? (
              "This offer has expired"
            ) : (
              `Time remaining: ${timeLeft.minutes.toString().padStart(2, '0')}:${timeLeft.seconds.toString().padStart(2, '0')}`
            )}
          </span>
        </div>

        {/* Property Details */}
        <div className="flex items-start space-x-4">
          {property.images && property.images.length > 0 && (
            <div className="flex-shrink-0">
              <img
                src={property.images[0].image_url}
                alt={property.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{property.title}</h3>
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location.city}, {property.location.state}</span>
            </div>
          </div>
        </div>

        {/* Offer Details */}
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <span className="text-sm text-gray-600">Available Nights:</span>
            <div className="flex items-center mt-1">
              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
              <span className="font-medium">{formatOfferedNights()}</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <span className="text-sm text-gray-600">Total Price:</span>
            <div className="text-xl font-bold text-gray-900 mt-1">
              {paymentUtils.formatAmount(offer.amount)}
            </div>
          </div>
        </div>

        {/* Warning */}
        {!isExpired && (
          <div className="flex items-start space-x-2 text-sm text-gray-600">
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
            <p>
              This offer will expire in {timeLeft.minutes} minutes and {timeLeft.seconds} seconds. 
              After that, these nights may be offered to other bidders.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button
            onClick={handleAccept}
            disabled={isExpired || isProcessing}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? "Processing..." : "Accept Offer"}
          </Button>
          
          <Button
            onClick={handleDecline}
            disabled={isProcessing}
            variant="outline"
            className="flex-1"
          >
            {isProcessing ? "Processing..." : "Decline Offer"}
          </Button>
        </div>

        {isExpired && (
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg text-center text-red-800 text-sm">
            This offer has expired and is no longer available.
            <br />
            The nights may have been offered to other bidders.
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 