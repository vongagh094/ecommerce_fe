"use client"

import { useState, useEffect } from "react"
import { Calendar, Clock, CheckCircle, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AuctionDetails, BidDetails, AwardedNight } from "@/types/auction-winners"
import { PropertyDetails } from "@/types"
import { paymentUtils } from "@/lib/api/payment"
import { winnerUtils } from "@/lib/api/auction-winners"

interface PartialWinSelectionProps {
  auction: AuctionDetails
  property: PropertyDetails
  originalBid: BidDetails
  awardedNights: AwardedNight[]
  onSelectionChange: (selectedNights: AwardedNight[]) => void
  onProceedToPayment: (selectedNights: AwardedNight[]) => void
  onDeclineAll: () => void
  isLoading?: boolean
}

interface NightRange {
  rangeId: string
  nights: AwardedNight[]
  startDate: string
  endDate: string
  totalAmount: number
  isSelected: boolean
}

export function PartialWinSelection({
  auction,
  property,
  originalBid,
  awardedNights,
  onSelectionChange,
  onProceedToPayment,
  onDeclineAll,
  isLoading = false
}: PartialWinSelectionProps) {
  const [nightRanges, setNightRanges] = useState<NightRange[]>([])
  const [selectedTotal, setSelectedTotal] = useState(0)
  const [showDeclineDialog, setShowDeclineDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Group awarded nights into consecutive ranges
  useEffect(() => {
    const ranges = winnerUtils.groupConsecutiveNightsWithDetails(awardedNights)
    setNightRanges(ranges.map(range => ({
      ...range,
      isSelected: true
    })))
    
    // Calculate initial total
    const initialTotal = ranges.reduce((sum, range) => 
      sum + range.nights.reduce((rangeSum, night) => rangeSum + night.pricePerNight, 0), 0)
    setSelectedTotal(initialTotal)
  }, [awardedNights])

  // Update parent component when selection changes
  useEffect(() => {
    const selectedNights = nightRanges
      .filter(range => range.isSelected)
      .flatMap(range => range.nights)
    
    onSelectionChange(selectedNights)
  }, [nightRanges, onSelectionChange])

  const handleRangeToggle = (rangeId: string) => {
    const updatedRanges = nightRanges.map(range => {
      if (range.rangeId === rangeId) {
        return { ...range, isSelected: !range.isSelected }
      }
      return range
    })
    
    setNightRanges(updatedRanges)
    
    // Recalculate total
    const newTotal = updatedRanges
      .filter(range => range.isSelected)
      .reduce((sum, range) => sum + range.totalAmount, 0)
    
    setSelectedTotal(newTotal)
  }

  const handleSelectAll = () => {
    const allSelected = nightRanges.every(range => range.isSelected)
    const updatedRanges = nightRanges.map(range => ({
      ...range,
      isSelected: !allSelected
    }))
    
    setNightRanges(updatedRanges)
    
    // Recalculate total
    const newTotal = !allSelected 
      ? awardedNights.reduce((sum, night) => sum + night.pricePerNight, 0)
      : 0
    
    setSelectedTotal(newTotal)
  }

  const handleProceedToPayment = async () => {
    setIsProcessing(true)
    try {
      const selectedNights = nightRanges
        .filter(range => range.isSelected)
        .flatMap(range => range.nights)
      
      await onProceedToPayment(selectedNights)
    } catch (error) {
      console.error('Failed to proceed to payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeclineAll = async () => {
    setIsProcessing(true)
    try {
      await onDeclineAll()
      setShowDeclineDialog(false)
    } catch (error) {
      console.error('Failed to decline bid:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const anySelected = nightRanges.some(range => range.isSelected)
  const allSelected = nightRanges.every(range => range.isSelected)
  const originalTotal = originalBid.totalAmount
  const percentOfOriginal = originalTotal > 0 ? (selectedTotal / originalTotal) * 100 : 0

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto border-amber-200 bg-amber-50/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-amber-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-amber-800">Partial Win</CardTitle>
          <p className="text-amber-700 text-lg">
            You won {awardedNights.length} of {winnerUtils.calculateTotalNights(originalBid.checkIn, originalBid.checkOut)} nights
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Property Information */}
          <div className="flex items-start space-x-4">
            {property.images && property.images.length > 0 && (
              <div className="flex-shrink-0">
                <img
                  src={property.images[0].image_url}
                  alt={property.title}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{property.title}</h2>
              <p className="text-gray-600">{property.location.city}, {property.location.state}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-gray-900">Select Your Nights</h3>
                <p className="text-gray-600 text-sm mt-1">
                  You can choose which night ranges you want to book. Select or deselect the ranges below.
                </p>
              </div>
            </div>
          </div>

          {/* Night Ranges Selection */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-900">Available Night Ranges</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleSelectAll}
              >
                {allSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>

            {nightRanges.map((range) => (
              <div 
                key={range.rangeId}
                className={`p-4 border rounded-lg transition-colors ${
                  range.isSelected 
                    ? "border-green-200 bg-green-50" 
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Checkbox 
                      id={`range-${range.rangeId}`}
                      checked={range.isSelected}
                      onCheckedChange={() => handleRangeToggle(range.rangeId)}
                    />
                    <div>
                      <label 
                        htmlFor={`range-${range.rangeId}`}
                        className="font-medium text-gray-900 cursor-pointer"
                      >
                        {winnerUtils.formatDateRange(range.startDate, range.endDate)}
                      </label>
                      <p className="text-sm text-gray-600">
                        {range.nights.length} night{range.nights.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {paymentUtils.formatAmount(range.totalAmount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {paymentUtils.formatAmount(range.totalAmount / range.nights.length)} × {range.nights.length}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Original bid total:</span>
                <span className="font-medium">{paymentUtils.formatAmount(originalTotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Selected nights total:</span>
                <span className="font-medium">{paymentUtils.formatAmount(selectedTotal)}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Percentage of original bid:</span>
                <span className="text-gray-500">{percentOfOriginal.toFixed(0)}%</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {paymentUtils.formatAmount(selectedTotal)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleProceedToPayment}
              disabled={isProcessing || isLoading || !anySelected}
              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white py-3 text-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Proceed to Payment
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(true)}
              disabled={isProcessing || isLoading}
              className="sm:w-auto"
            >
              Decline All Offers
            </Button>
          </div>

          {/* Important Notes */}
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Important Notes:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>You must select at least one night range to proceed to payment</li>
              <li>If you decline all offers, these nights may be offered to other bidders</li>
              <li>Payment must be completed before the deadline to secure your booking</li>
              <li>After successful payment, you'll receive booking confirmation via email</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Decline Confirmation Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline All Offers?</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline all partial offers? This action cannot be undone, 
              and these nights may be offered to other bidders.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeclineAll}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Yes, Decline All'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 