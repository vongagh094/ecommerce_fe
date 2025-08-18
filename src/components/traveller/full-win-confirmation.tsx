"use client"

import { useState } from "react"
import { Trophy, Calendar, MapPin, Users, Clock, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { AuctionDetails, BidDetails } from "@/types/auction-winners"
import { PropertyDetails } from "@/types"
import { paymentUtils } from "@/lib/api/payment"
import { winnerUtils } from "@/lib/api/auction-winners"

interface FullWinConfirmationProps {
  auction: AuctionDetails
  property: PropertyDetails
  bidDetails: BidDetails
  paymentDeadline: string
  onProceedToPayment: () => void
  onDecline: () => void
  isLoading?: boolean
}

export function FullWinConfirmation({
  auction,
  property,
  bidDetails,
  paymentDeadline,
  onProceedToPayment,
  onDecline,
  isLoading = false
}: FullWinConfirmationProps) {
  const [showDeclineDialog, setShowDeclineDialog] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const totalNights = winnerUtils.calculateTotalNights(bidDetails.checkIn, bidDetails.checkOut)
  const timeRemaining = winnerUtils.getPaymentTimeRemaining(paymentDeadline)
  const isExpired = winnerUtils.isPaymentExpired(paymentDeadline)

  const handleProceedToPayment = async () => {
    setIsProcessing(true)
    try {
      await onProceedToPayment()
    } catch (error) {
      console.error('Failed to proceed to payment:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    setIsProcessing(true)
    try {
      await onDecline()
      setShowDeclineDialog(false)
    } catch (error) {
      console.error('Failed to decline bid:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isExpired) {
    return (
      <Card className="w-full max-w-4xl mx-auto border-red-200 bg-red-50/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-red-800">Payment Deadline Expired</h1>
          <p className="text-red-600">
            Unfortunately, the payment deadline for this auction has passed.
          </p>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-6">
            This booking opportunity is no longer available and may have been offered to other bidders.
          </p>
          <Button variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto border-green-200 bg-green-50/50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-green-800">Congratulations!</h1>
          <p className="text-green-700 text-lg">
            You won the entire bid for {totalNights} night{totalNights > 1 ? 's' : ''}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Property Information */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">{property.title}</h2>
              
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>{property.location.address_line1}, {property.location.city}, {property.location.state}</span>
                </div>
                
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Up to {property.max_guests} guests</span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="mt-4 p-4 bg-white rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-3">Booking Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Check-in</div>
                    <div className="font-medium">
                      {new Date(bidDetails.checkIn).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">Check-out</div>
                    <div className="font-medium">
                      {new Date(bidDetails.checkOut).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total nights:</span>
                    <span className="font-medium">{totalNights}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-gray-600">Price per night:</span>
                    <span className="font-medium">{paymentUtils.formatAmount(bidDetails.pricePerNight)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Property Image */}
            <div>
              {property.images && property.images.length > 0 && (
                <div className="aspect-video rounded-lg overflow-hidden">
                  <img
                    src={property.images[0].image_url}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {paymentUtils.formatAmount(bidDetails.pricePerNight)} × {totalNights} night{totalNights > 1 ? 's' : ''}
                </span>
                <span className="font-medium">{paymentUtils.formatAmount(bidDetails.totalAmount)}</span>
              </div>
              
              <div className="border-t pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {paymentUtils.formatAmount(bidDetails.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Deadline */}
          <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-orange-600 mr-2" />
              <div>
                <div className="font-medium text-orange-800">Payment Required</div>
                <div className="text-sm text-orange-700">
                  Complete payment within {timeRemaining} to secure your booking
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleProceedToPayment}
              disabled={isProcessing || isLoading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 text-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Pay Now with ZaloPay
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDeclineDialog(true)}
              disabled={isProcessing || isLoading}
              className="sm:w-auto"
            >
              Decline Offer
            </Button>
          </div>

          {/* Important Notes */}
          <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Important Notes:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Payment must be completed before the deadline to secure your booking</li>
              <li>If payment is not completed in time, this offer will expire</li>
              <li>After successful payment, you'll receive booking confirmation via email</li>
              <li>You can contact the host through our messaging system after booking</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Decline Confirmation Dialog */}
      <Dialog open={showDeclineDialog} onOpenChange={setShowDeclineDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline This Offer?</DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this winning bid? This action cannot be undone, 
              and the booking opportunity will be lost.
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
              onClick={handleDecline}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Yes, Decline Offer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}