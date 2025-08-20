"use client"

import { useState } from "react"
import { Calendar, Clock, Trophy, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WinningBid, PartialNight } from "@/types/auction-winners"
import { paymentUtils } from "@/lib/api/payment"
import { winnerUtils } from "@/lib/api/auction-winners"

interface WinnerNotificationCardProps {
  winningBid: WinningBid
  onPaymentClick: () => void
  onViewDetails: () => void
  onDismiss?: () => void
}

export function WinnerNotificationCard({
  winningBid,
  onPaymentClick,
  onViewDetails,
  onDismiss
}: WinnerNotificationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const {
    property,
    bidAmount,
    checkIn,
    checkOut,
    isPartialWin,
    awardedNights,
    status,
    paymentDeadline
  } = winningBid

  const isPaymentPending = winnerUtils.hasPendingPayment(winningBid)
  const isExpired = winnerUtils.isPaymentExpired(paymentDeadline)
  const timeRemaining = winnerUtils.getPaymentTimeRemaining(paymentDeadline)
  const totalNights = winnerUtils.calculateTotalNights(checkIn, checkOut)
  const awardedNightCount = awardedNights.length

  const getStatusBadge = () => {
    if (isExpired) {
      return <Badge variant="destructive">Expired</Badge>
    }
    if (status === 'PAID') {
      return <Badge variant="default" className="bg-green-500">Paid</Badge>
    }
    if (isPaymentPending) {
      return <Badge variant="secondary">Payment Required</Badge>
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const getWinTypeDisplay = () => {
    if (isPartialWin) {
      return (
        <div className="flex items-center space-x-2">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-medium text-amber-700">
            Partial Win - {awardedNightCount} of {totalNights} nights
          </span>
        </div>
      )
    }
    return (
      <div className="flex items-center space-x-2">
        <Trophy className="h-4 w-4 text-green-500" />
        <span className="text-sm font-medium text-green-700">
          Full Win - All {totalNights} nights
        </span>
      </div>
    )
  }

  return (
    <Card className={`w-full transition-all duration-200 ${
      isPaymentPending && !isExpired 
        ? 'border-blue-200 bg-blue-50/50' 
        : isExpired 
        ? 'border-red-200 bg-red-50/50'
        : 'border-gray-200'
    }`}>
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                {property.title}
              </h3>
              {getStatusBadge()}
            </div>
            
            {getWinTypeDisplay()}
            
            <div className="flex items-center text-sm text-gray-600 mt-1">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{property.location.city}, {property.location.state}</span>
            </div>
          </div>
          
          {property.images && property.images.length > 0 && (
            <div className="ml-4 flex-shrink-0">
              <img
                src={property.images[0].image_url}
                alt={property.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            </div>
          )}
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Check-in</div>
              <div className="text-sm font-medium">
                {new Date(checkIn).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-xs text-gray-500 uppercase">Check-out</div>
              <div className="text-sm font-medium">
                {new Date(checkOut).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Partial Win Details */}
        {isPartialWin && (
          <div className="mb-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {isExpanded ? 'Hide' : 'Show'} awarded nights details
            </button>
            
            {isExpanded && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Awarded Nights:
                </div>
                <div className="space-y-1">
                  {winnerUtils.groupConsecutiveNights(awardedNights.map(n => n.date)).map((range : any, index: number) => (
                    <div key={index} className="text-sm text-gray-700">
                      {winnerUtils.formatDateRange(range.start, range.end)} 
                      ({range.nights.length} night{range.nights.length > 1 ? 's' : ''})
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Info */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-xl font-bold text-gray-900">
              {paymentUtils.formatAmount(bidAmount)}
            </div>
          </div>
          
          {isPaymentPending && !isExpired && (
            <div className="text-right">
              <div className="flex items-center text-sm text-orange-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>{timeRemaining}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Payment deadline
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {isPaymentPending && !isExpired && (
            <Button 
              onClick={onPaymentClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Pay Now with ZaloPay
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onViewDetails}
            className={isPaymentPending && !isExpired ? "flex-none" : "flex-1"}
          >
            View Details
          </Button>
          
          {onDismiss && (status === 'PAID' || isExpired) && (
            <Button 
              variant="ghost" 
              onClick={onDismiss}
              className="flex-none px-3"
            >
              ×
            </Button>
          )}
        </div>

        {/* Expired Warning */}
        {isExpired && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-sm text-red-800">
              <strong>Payment Expired:</strong> This offer has expired and is no longer available. 
              The nights may have been offered to other bidders.
            </div>
          </div>
        )}

        {/* Success Message */}
        {status === 'PAID' && (
          <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="text-sm text-green-800">
              <strong>Payment Successful:</strong> Your booking has been confirmed! 
              Check your email for booking details.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}