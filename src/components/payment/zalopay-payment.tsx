"use client"

import { useState, useEffect } from "react"
import { CreditCard, Shield, Clock, AlertCircle, CheckCircle, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BookingDetails, PaymentError } from "@/types/payment"
import { paymentApi, paymentUtils, PaymentErrorHandler } from "@/lib/api/payment"
import { v4 as uuidv4 } from 'uuid'
import { useAuth } from "@/contexts/auth-context"
import { useAuth0 } from "@/contexts/auth0-context"

// Deterministic date formatter to avoid SSR/CSR locale/timezone mismatches
const formatDate = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString)
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC',
    }).format(date)
  } catch {
    return isoDateString
  }
}

interface ZaloPayPaymentProps {
  bookingDetails: BookingDetails
  amount: number
  onPaymentSuccess: (transactionId: string) => void
  onPaymentError: (error: PaymentError) => void
  onPaymentCancel: () => void
}

export function ZaloPayPayment({
  bookingDetails,
  amount,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel
}: ZaloPayPaymentProps) {
  const [paymentState, setPaymentState] = useState<'idle' | 'creating' | 'redirecting' | 'verifying' | 'completed' | 'failed' | 'auth_required'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [appTransId, setAppTransId] = useState<string | null>(null)
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const maxVerificationAttempts = 10
  const { isLoggedIn } = useAuth()
  const { loginWithRedirect } = useAuth0()

  // Check for return from ZaloPay
  useEffect(() => {
    const urlAppTransId = paymentUtils.parseAppTransIdFromUrl()
    if (urlAppTransId && paymentState === 'idle') {
      setAppTransId(urlAppTransId)
      setPaymentState('verifying')
      verifyPaymentStatus(urlAppTransId)
    }
  }, [])

  const handleLogin = () => {
    // Save current URL for return after login
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      localStorage.setItem('auth_return_url', currentUrl)
    }
    
    // Redirect to login
    loginWithRedirect({
      appState: { 
        returnTo: typeof window !== 'undefined' ? window.location.href : '/' 
      }
    })
  }

  const handlePaymentInitiation = async () => {
    if (!isLoggedIn) {
      setPaymentState('auth_required')
      return
    }

    if (!paymentUtils.validatePaymentAmount(amount)) {
      setError('Invalid payment amount')
      return
    }

    // Save current URL to localStorage for redirect after payment
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href
      localStorage.setItem('payment_return_url', currentUrl)
    }

    // Mock mode: bypass backend and redirect to local session page
    if (process.env.NEXT_PUBLIC_PAYMENT_MOCK === '1') {
      setPaymentState('redirecting')
      setError(null)
      const mockAppTransId = `demo_${Date.now()}`
      const mockSessionId = `session_${Date.now()}`
      setAppTransId(mockAppTransId)
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = `/dashboard/payment/zalopay/${mockSessionId}?appTransId=${mockAppTransId}`
        }
      }, 800)
      return
    }

    setPaymentState('creating')
    setError(null)

    try {
      const orderInfo = paymentUtils.generateOrderInfo(
        bookingDetails.propertyName,
        bookingDetails.checkIn,
        bookingDetails.checkOut,
      )
      const auctionId = uuidv4()
      const paymentRequest = {
        auctionId,
        selectedNights: bookingDetails.selectedNights,
        amount,
        orderInfo,
        redirectParams: bookingDetails.redirectParams
      }

      const response = await paymentApi.createPayment(paymentRequest)
      
      setAppTransId(response.appTransId)
      setPaymentState('redirecting')

      // Small delay to show the redirecting state
      setTimeout(() => {
        window.location.href = response.orderUrl
      }, 1000)

    } catch (error: any) {
      console.error('Payment creation failed:', error)
      
      // Check if error is authentication related
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED' || error.code === 'AUTH_TOKEN_ERROR') {
        setPaymentState('auth_required')
      } else {
        const errorAction = PaymentErrorHandler.handlePaymentError(error)
        setError(errorAction.message)
        setPaymentState('failed')
        onPaymentError(error)
      }
    }
  }

  const verifyPaymentStatus = async (transactionId: string) => {
    if (verificationAttempts >= maxVerificationAttempts) {
      setError('Payment verification timeout. Please contact support.')
      setPaymentState('failed')
      return
    }

    // Mock mode: simulate pending → success
    if (process.env.NEXT_PUBLIC_PAYMENT_MOCK === '1') {
      const attempt = verificationAttempts + 1
      setVerificationAttempts(attempt)
      setTimeout(() => {
        setPaymentState('completed')
        onPaymentSuccess(`txn_${appTransId || transactionId}`)
      }, 1200)
      return
    }

    try {
      const statusResponse = await paymentApi.verifyPayment(transactionId)
      
      switch (statusResponse.status) {
        case 'PAID':
          setPaymentState('completed')
          onPaymentSuccess(statusResponse.transactionId || transactionId)
          break
          
        case 'FAILED':
        case 'CANCELLED':
          setError(`Payment ${statusResponse.status.toLowerCase()}. Please try again.`)
          setPaymentState('failed')
          onPaymentError(new PaymentError('PAYMENT_FAILED', `Payment ${statusResponse.status}`, statusResponse))
          break
          
        case 'PENDING':
          // Continue verification after delay
          setVerificationAttempts(prev => prev + 1)
          setTimeout(() => verifyPaymentStatus(transactionId), 3000)
          break
          
        default:
          setError('Unknown payment status. Please contact support.')
          setPaymentState('failed')
      }
    } catch (error: any) {
      console.error('Payment verification failed:', error)
      
      // Check if error is authentication related
      if (error.status === 401 || error.code === 'AUTH_REQUIRED' || error.code === 'AUTH_FAILED' || error.code === 'AUTH_TOKEN_ERROR') {
        setPaymentState('auth_required')
        return
      }
      
      setVerificationAttempts(prev => prev + 1)
      
      // Retry verification after delay
      setTimeout(() => verifyPaymentStatus(transactionId), 5000)
    }
  }

  const handleRetryPayment = () => {
    setPaymentState('idle')
    setError(null)
    setAppTransId(null)
    setVerificationAttempts(0)
  }

  const renderPaymentState = () => {
    switch (paymentState) {
      case 'auth_required':
        return (
          <div className="text-center py-8">
            <LogIn className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 mb-6">
              You need to be logged in to make a payment. Please log in to continue.
            </p>
            <Button 
              onClick={handleLogin}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Log In to Continue
            </Button>
          </div>
        )

      case 'creating':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Creating Payment Order</h3>
            <p className="text-gray-600">Please wait while we prepare your payment...</p>
          </div>
        )

      case 'redirecting':
        return (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Redirecting to ZaloPay</h3>
            <p className="text-gray-600">You will be redirected to ZaloPay to complete your payment...</p>
          </div>
        )

      case 'verifying':
        return (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Payment</h3>
            <p className="text-gray-600">
              Please wait while we verify your payment status...
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Attempt {verificationAttempts + 1} of {maxVerificationAttempts}
            </p>
          </div>
        )

      case 'completed':
        return (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">
              Your payment has been processed successfully. You will be redirected to your booking confirmation.
            </p>
          </div>
        )

      case 'failed':
        return (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Payment Failed</h3>
            {error && (
              <Alert className="mb-4 text-left">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-x-3">
              <Button onClick={handleRetryPayment} variant="outline">
                Try Again
              </Button>
              <Button onClick={onPaymentCancel} variant="ghost">
                Cancel
              </Button>
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property:</span>
                  <span className="font-medium">{bookingDetails.propertyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-in:</span>
                  <span className="font-medium">
                    {formatDate(bookingDetails.checkIn)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Check-out:</span>
                  <span className="font-medium">
                    {formatDate(bookingDetails.checkOut)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nights:</span>
                  <span className="font-medium">{bookingDetails.selectedNights.length}</span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                    <span className="text-xl font-bold text-gray-900">
                      {paymentUtils.formatAmount(amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="flex items-start">
                <Shield className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Secure Payment</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Your payment will be processed securely through ZaloPay. 
                    You will be redirected to ZaloPay's secure payment gateway.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <Button
              onClick={handlePaymentInitiation}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
              disabled={paymentState !== 'idle'}
            >
              <CreditCard className="h-5 w-5 mr-2" />
              Pay with ZaloPay
            </Button>

            {/* Cancel Option */}
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={onPaymentCancel}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel Payment
              </Button>
            </div>

            {/* Payment Info */}
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>Payment session expires in 15 minutes</span>
              </div>
              <p>
                After clicking "Pay with ZaloPay", you'll be redirected to ZaloPay's secure payment page. 
                Complete your payment there and you'll be brought back to confirm your booking.
              </p>
            </div>
          </div>
        )
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="h-6 w-6 mr-2" />
          Payment with ZaloPay
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderPaymentState()}
      </CardContent>
    </Card>
  )
}