"use client"

import { useState } from "react"
import { CheckCircle, Calendar, MapPin, User, MessageCircle, Printer, Share, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { paymentUtils } from "@/lib/api/payment"

interface BookingConfirmationProps {
  booking: {
    id: string
    referenceNumber: string
    propertyId: string
    propertyName: string
    hostId: string
    hostName?: string
    checkIn: string
    checkOut: string
    guestCount: number
    totalAmount: number
    status: 'CONFIRMED' | 'PENDING' | 'CANCELLED'
    createdAt: string
    property?: {
      images?: { image_url: string }[]
      location?: {
        address_line1?: string
        city?: string
        state?: string
      }
    }
  }
  onViewBooking: () => void
  onContactHost: () => void
  onViewProperty: () => void
}

export function BookingConfirmation({
  booking,
  onViewBooking,
  onContactHost,
  onViewProperty
}: BookingConfirmationProps) {
  const [isSharingModalOpen, setIsSharingModalOpen] = useState(false)
  
  const handlePrintConfirmation = () => {
    window.print()
  }
  
  const handleShareBooking = () => {
    setIsSharingModalOpen(true)
    // In a real implementation, you would open a sharing modal
    // For now, we'll just simulate it with an alert
    alert("Sharing functionality would be implemented here")
    setIsSharingModalOpen(false)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  const calculateNights = () => {
    const checkIn = new Date(booking.checkIn)
    const checkOut = new Date(booking.checkOut)
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }
  
  const nights = calculateNights()
  
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-green-200">
        <CardHeader className="text-center pb-6 border-b">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Booking Confirmed!</CardTitle>
          <p className="text-green-600 mt-2">
            Your booking has been confirmed and your payment has been processed successfully.
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* Property Information */}
          <div className="flex items-start space-x-4">
            {booking.property?.images && booking.property.images.length > 0 && (
              <div className="flex-shrink-0">
                <img
                  src={booking.property.images[0].image_url}
                  alt={booking.propertyName}
                  className="w-24 h-24 rounded-lg object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{booking.propertyName}</h3>
              {booking.property?.location && (
                <div className="flex items-center text-sm text-gray-600 mt-1">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>
                    {booking.property.location.address_line1 && `${booking.property.location.address_line1}, `}
                    {booking.property.location.city && `${booking.property.location.city}, `}
                    {booking.property.location.state && booking.property.location.state}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Reference:</span>
                <span className="font-semibold">{booking.referenceNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-semibold">{formatDate(booking.checkIn)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-semibold">{formatDate(booking.checkOut)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Nights:</span>
                <span className="font-semibold">{nights}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Guests:</span>
                <span className="font-semibold">{booking.guestCount}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600">{booking.status}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Booking Date:</span>
                <span className="font-semibold">{formatDate(booking.createdAt)}</span>
              </div>
              
              <div className="pt-3 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-900 font-medium">Total Amount:</span>
                  <span className="text-xl font-bold text-gray-900">
                    {paymentUtils.formatAmount(booking.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Host Information */}
          {booking.hostName && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Host Information</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500 mr-2" />
                    <span className="font-medium">{booking.hostName}</span>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onContactHost}
                    className="flex items-center"
                  >
                    <MessageCircle className="h-4 w-4 mr-1" />
                    Contact Host
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={onViewBooking} 
                className="flex items-center justify-center bg-blue-600 hover:bg-blue-700"
              >
                <Calendar className="h-5 w-5 mr-2" />
                View Booking Details
              </Button>
              
              <Button 
                onClick={onViewProperty} 
                variant="outline"
                className="flex items-center justify-center"
              >
                <MapPin className="h-5 w-5 mr-2" />
                View Property
              </Button>
              
              <Button 
                onClick={handlePrintConfirmation} 
                variant="outline"
                className="flex items-center justify-center"
              >
                <Printer className="h-5 w-5 mr-2" />
                Print Confirmation
              </Button>
              
              <Button 
                onClick={handleShareBooking} 
                variant="outline"
                className="flex items-center justify-center"
              >
                <Share className="h-5 w-5 mr-2" />
                Share Booking
              </Button>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Important Information</h4>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5" />
                <span>Please have your booking reference number ready when checking in.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5" />
                <span>Contact the host before arrival to confirm check-in details.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5" />
                <span>A confirmation email has been sent to your registered email address.</span>
              </li>
              <li className="flex items-start">
                <ArrowRight className="h-4 w-4 mr-2 mt-0.5" />
                <span>You can view and manage your booking in the "My Trips" section of your account.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 