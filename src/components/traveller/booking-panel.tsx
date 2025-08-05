"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Users } from "lucide-react"
import { formatPrice, validationBidAmount } from "@/lib/utils"
import { AvailabilityCalendar, AuctionInfo } from "@/types"

interface BookingPanelProps {
  currentBid: number
  lowestOffer: number
  timeLeft: string
  propertyId: string
  basePrice: number
  cleaningFee: number
  serviceFee: number
  availabilityCalendar: AvailabilityCalendar
  activeAuctions: AuctionInfo[]
}

export function BookingPanel({ 
  currentBid, 
  lowestOffer, 
  timeLeft, 
  propertyId,
  basePrice,
  cleaningFee,
  serviceFee,
  availabilityCalendar,
  activeAuctions 
}: BookingPanelProps) {
  const [bidAmount, setBidAmount] = useState<string>("")
  const [checkIn, setCheckIn] = useState<string>("")
  const [checkOut, setCheckOut] = useState<string>("")
  const [guests, setGuests] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const activeAuction = activeAuctions?.[0]
  const hasActiveAuction = activeAuction && activeAuction.status === 'ACTIVE'

  const validationError = bidAmount ? validationBidAmount(bidAmount, currentBid) : null

  const calculateNights = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const calculateTotal = () => {
    const nights = calculateNights()
    if (nights === 0) return 0
    
    const pricePerNight = bidAmount ? parseFloat(bidAmount) : basePrice
    const subtotal = pricePerNight * nights
    return subtotal + cleaningFee + serviceFee
  }

  const handleSubmit = async () => {
    if (validationError || !checkIn || !checkOut) return
    
    setIsSubmitting(true)
    try {
      // TODO: Implement bid submission API call
      console.log('Submitting bid:', {
        propertyId,
        bidAmount: parseFloat(bidAmount),
        checkIn,
        checkOut,
        guests,
        auctionId: activeAuction?.id
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Reset form or show success message
      setBidAmount("")
    } catch (error) {
      console.error('Bid submission failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="sticky top-24">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Pricing Header */}
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-semibold text-gray-900">
              {formatPrice(basePrice)}
            </span>
            <span className="text-gray-600">per night</span>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                CHECK-IN
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
                CHECKOUT
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Guests Selection */}
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase block mb-2">
              GUESTS
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="number"
                value={guests}
                onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                min="1"
                className="pl-10"
              />
            </div>
          </div>

          {/* Auction Information */}
          {hasActiveAuction && (
            <div className="bg-rose-50 p-4 rounded-lg">
              <h4 className="font-medium text-rose-900 mb-2">Active Auction</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-rose-700">Current highest bid</span>
                  <span className="font-semibold text-rose-900">
                    {formatPrice(currentBid)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-rose-700">Time left</span>
                  <span className="font-medium text-rose-600">{timeLeft}</span>
                </div>
              </div>
            </div>
          )}

          {/* Bid Input (only show if auction is active) */}
          {hasActiveAuction && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your bid (per night)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  ₫
                </span>
                <Input
                  type="text"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum ${formatPrice(currentBid + 1)}`}
                  className="pl-8"
                />
              </div>
              {validationError && (
                <p className="text-sm text-red-600 mt-1">{validationError}</p>
              )}
            </div>
          )}

          {/* Price Breakdown */}
          {checkIn && checkOut && (
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  {formatPrice(bidAmount ? parseFloat(bidAmount) : basePrice)} × {calculateNights()} nights
                </span>
                <span>
                  {formatPrice((bidAmount ? parseFloat(bidAmount) : basePrice) * calculateNights())}
                </span>
              </div>
              {cleaningFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Cleaning fee</span>
                  <span>{formatPrice(cleaningFee)}</span>
                </div>
              )}
              {serviceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Service fee</span>
                  <span>{formatPrice(serviceFee)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(calculateTotal())}</span>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Button
            className="w-full bg-rose-500 hover:bg-rose-600 text-white"
            onClick={handleSubmit}
            disabled={
              isSubmitting || 
              !checkIn || 
              !checkOut || 
              (hasActiveAuction && (!bidAmount || !!validationError))
            }
          >
            {isSubmitting 
              ? "Processing..." 
              : hasActiveAuction 
                ? "Place a bid" 
                : "Reserve"
            }
          </Button>

          {/* Additional Info */}
          <p className="text-xs text-gray-500 text-center">
            You won't be charged yet
          </p>
        </div>
      </CardContent>
    </Card>
  )
}