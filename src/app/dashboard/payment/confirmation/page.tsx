"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, Calendar, MessageCircle, Home, ArrowRight, Printer, Share } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { paymentApi } from "@/lib/api/payment"
import { auctionWinnerApi } from "@/lib/api/auction-winners"
import { paymentWebSocketHandler } from "@/lib/websocket"
import type { PaymentNotificationMessage } from "@/types/auction-winners"
import { useAuth0 } from "@/contexts/auth0-context"

export default function PaymentConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const transactionId = searchParams.get('transactionId')
  const sessionId = searchParams.get('sessionId')
  const auctionId = searchParams.get('auctionId')
  const appTransId = searchParams.get('apptransid') || searchParams.get('appTransId')
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)
  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [bookingRetryAttempts, setBookingRetryAttempts] = useState(0)
  const maxBookingRetries = 5
  const { user } = useAuth0()

  useEffect(() => {
    if (!transactionId && !sessionId) {
      setError("Missing payment information")
      setIsLoading(false)
      return
    }
    
    fetchPaymentConfirmation()
  }, [transactionId, sessionId])

  const fetchPaymentConfirmation = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch payment confirmation details
      const paymentConfirmation = transactionId 
        ? await paymentApi.getPaymentByTransactionId(transactionId)
        : await paymentApi.getPaymentSession(sessionId!)
      
      if (!paymentConfirmation) {
        setError("Payment details not found")
        setIsLoading(false)
        return
      }
      
      setPaymentDetails(paymentConfirmation)
      
      // Fetch booking details if payment was successful
      if (paymentConfirmation.status === 'PAID') {
        try {
          const booking = await paymentApi.getBookingByPaymentId(paymentConfirmation.id)
          setBookingDetails(booking)
          setBookingRetryAttempts(0)
        } catch (e) {
          // If booking is not yet available, we'll retry below
          setBookingDetails(null)
        }
      }
      
    } catch (error) {
      console.error("Failed to fetch payment confirmation:", error)
      setError("Failed to load payment confirmation. Please contact support.")
    } finally {
      setIsLoading(false)
    }
  }

  // Retry fetching booking details if payment is PAID but booking not ready yet
  useEffect(() => {
    if (
      paymentDetails && paymentDetails.status === 'PAID' &&
      !bookingDetails && bookingRetryAttempts < maxBookingRetries
    ) {
      const delay = 2000 + bookingRetryAttempts * 1000 // incremental backoff
      const t = setTimeout(async () => {
        try {
          const booking = await paymentApi.getBookingByPaymentId(paymentDetails.id)
          setBookingDetails(booking)
          setBookingRetryAttempts(0)
        } catch (e) {
          setBookingRetryAttempts(prev => prev + 1)
        }
      }, delay)
      return () => clearTimeout(t)
    }
  }, [paymentDetails, bookingDetails, bookingRetryAttempts])

  // WebSocket: listen for BOOKING_CONFIRMED and refresh booking immediately
  useEffect(() => {
    const userId = user?.sub || null
    if (!userId) return
    if (!paymentDetails || paymentDetails.status !== 'PAID') return

    const onMessage = async (message: PaymentNotificationMessage) => {
      if (message.type !== 'BOOKING_CONFIRMED') return
      if (message.userId !== userId) return

      try {
        const booking = await paymentApi.getBookingByPaymentId(paymentDetails.id)
        setBookingDetails(booking)
        setBookingRetryAttempts(0)
      } catch (e) {
        // Ignore; retry/backoff effect will continue
      }
    }

    paymentWebSocketHandler.connect(userId, onMessage)
    return () => paymentWebSocketHandler.disconnect()
  }, [user, paymentDetails])

  const handleRefreshBooking = async () => {
    if (!paymentDetails) return
    try {
      const booking = await paymentApi.getBookingByPaymentId(paymentDetails.id)
      setBookingDetails(booking)
      setBookingRetryAttempts(0)
    } catch (e) {
      setBookingRetryAttempts(prev => Math.min(prev + 1, maxBookingRetries))
    }
  }

  const handleViewBooking = () => {
    router.push(`/dashboard/trips/${bookingDetails.id}`)
  }

  const handleContactHost = () => {
    router.push(`/dashboard/messages?hostId=${bookingDetails.hostId}`)
  }

  const handleViewProperty = () => {
    router.push(`/property/${bookingDetails.propertyId}`)
  }

  const handlePrintConfirmation = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner message="Loading payment confirmation..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Payment Confirmation Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{error}</p>
            
            <div className="flex space-x-3">
              <Button onClick={() => router.push("/dashboard/winners")} variant="outline">
                Return to Dashboard
              </Button>
              <Button onClick={() => router.push("/dashboard/payment/support")} variant="ghost">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentDetails || paymentDetails.status !== 'PAID') {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-600">Payment Not Completed</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              This payment has not been completed or is still being processed. Please check your payment status in your dashboard.
            </p>
            
            <Button onClick={() => router.push("/dashboard/winners")} variant="outline">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="border-green-200">
        <CardHeader className="text-center pb-6 border-b">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Payment Successful!</CardTitle>
          <p className="text-green-600 mt-2">
            Your booking has been confirmed and your payment has been processed successfully.
          </p>
        </CardHeader>

        <CardContent className="pt-6 space-y-8">
          {/* Booking Details */}
          {bookingDetails && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Reference:</span>
                    <span className="font-semibold">{bookingDetails.referenceNumber}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Property:</span>
                    <span className="font-semibold">{bookingDetails.propertyName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold">
                      {new Date(bookingDetails.checkIn).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold">
                      {new Date(bookingDetails.checkOut).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Guests:</span>
                    <span className="font-semibold">{bookingDetails.guestCount}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID:</span>
                    <span className="font-semibold">{paymentDetails.transactionId || transactionId}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="font-semibold">ZaloPay</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Date:</span>
                    <span className="font-semibold">
                      {new Date(paymentDetails.paidAt || paymentDetails.updatedAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-semibold text-lg">
                      {paymentDetails.amount.toLocaleString()} {paymentDetails.currency}
                    </span>
                  </div>
                </div>
              </div>

              {/* Next Steps */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={handleViewBooking} 
                    className="flex items-center justify-center bg-blue-600 hover:bg-blue-700"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    View Booking Details
                  </Button>
                  
                  <Button 
                    onClick={handleContactHost} 
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Message Host
                  </Button>
                  
                  <Button 
                    onClick={handleViewProperty} 
                    variant="outline"
                    className="flex items-center justify-center"
                  >
                    <Home className="h-5 w-5 mr-2" />
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
                </div>
              </div>
            </div>
          )}

          {/* No Booking Found */}
          {!bookingDetails && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Your payment was successful, but we're still processing your booking. 
                You'll receive a confirmation email shortly.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Checking again{bookingRetryAttempts > 0 ? ` (attempt ${bookingRetryAttempts + 1}/${maxBookingRetries})` : ''}...
              </p>
              
              <div className="flex gap-3 justify-center">
                <Button onClick={handleRefreshBooking} variant="outline">
                  Refresh Booking
                </Button>
                <Button onClick={() => router.push("/dashboard/winners")} variant="ghost">
                  Return to Dashboard
                </Button>
              </div>
            </div>
          )}

          {/* Confirmation Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800">
              A confirmation email has been sent to your registered email address.
            </p>
          </div>

          {/* Return to Dashboard */}
          <div className="text-center pt-4">
            <Button 
              onClick={() => router.push("/dashboard")}
              variant="ghost"
              className="flex items-center mx-auto"
            >
              Return to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 