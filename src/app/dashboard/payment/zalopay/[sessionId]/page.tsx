"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Shield, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { paymentApi } from "@/lib/api/payment"
import { PaymentSession, PaymentStatus } from "@/types/payment"
import { paymentWebSocketHandler } from "@/lib/websocket"
import type { PaymentNotificationMessage } from "@/types/auction-winners"
import { useAuth0 } from "@auth0/auth0-react"

export default function ZaloPayProcessingPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const { sessionId } = params
  const { user } = useAuth0()
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentSession, setPaymentSession] = useState<PaymentSession | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('CREATED')
  const [verificationAttempts, setVerificationAttempts] = useState(0)
  const maxVerificationAttempts = 10

  useEffect(() => {
    fetchPaymentSession()
  }, [sessionId])

  // Optional: Use WebSocket to reduce polling and react to status updates
  useEffect(() => {
    const userId = user?.sub || null
    if (!userId) return

    const onMessage = (message: PaymentNotificationMessage) => {
      if (message.type !== 'PAYMENT_STATUS') return
      // Only handle messages for current payment session if we have it
      if (!paymentSession) return
      if (message.userId !== userId) return
      if (message.paymentId !== paymentSession.id) return

      if (message.status === 'COMPLETED') {
        router.push(`/dashboard/payment/confirmation?transactionId=${message.transactionId}&sessionId=${sessionId}`)
      } else if (message.status === 'FAILED') {
        setError('Payment failed. Please try again.')
        setPaymentStatus('FAILED')
      }
    }

    paymentWebSocketHandler.connect(userId, onMessage)
    return () => paymentWebSocketHandler.disconnect()
  }, [user, paymentSession, sessionId])

  const fetchPaymentSession = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Fetch the payment session details
      const session = await paymentApi.getPaymentSession(sessionId)
      
      if (!session) {
        setError("Payment session not found")
        setIsLoading(false)
        return
      }
      
      setPaymentSession(session)
      setPaymentStatus(session.status)
      
      // If payment is still pending, start verification
      if (session.status === 'PENDING') {
        verifyPaymentStatus(session.appTransId)
      }
      
    } catch (error) {
      console.error("Failed to fetch payment session:", error)
      setError("Failed to load payment details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const verifyPaymentStatus = async (appTransId: string) => {
    if (verificationAttempts >= maxVerificationAttempts) {
      setError('Payment verification timeout. Please check your payment status in your account.')
      return
    }

    try {
      const statusResponse = await paymentApi.verifyPayment(appTransId)
      
      setPaymentStatus(statusResponse.status)
      
      switch (statusResponse.status) {
        case 'PAID':
          // Navigate to confirmation page
          router.push(`/dashboard/payment/confirmation?transactionId=${statusResponse.transactionId}&sessionId=${sessionId}`)
          break
          
        case 'FAILED':
        case 'CANCELLED':
          setError(`Payment ${statusResponse.status.toLowerCase()}. Please try again.`)
          break
          
        case 'PENDING':
          // Continue verification after delay
          setVerificationAttempts(prev => prev + 1)
          setTimeout(() => verifyPaymentStatus(appTransId), 3000)
          break
          
        default:
          setError('Unknown payment status. Please contact support.')
      }
    } catch (error) {
      console.error('Payment verification failed:', error)
      setVerificationAttempts(prev => prev + 1)
      
      // Retry verification after delay
      setTimeout(() => verifyPaymentStatus(appTransId), 5000)
    }
  }

  const handleRetry = () => {
    setVerificationAttempts(0)
    fetchPaymentSession()
  }

  const handleCancel = () => {
    router.push('/dashboard/winners')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner message="Loading payment session..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-red-500" />
              Payment Error
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="flex space-x-3">
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
              <Button onClick={handleCancel} variant="ghost">
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!paymentSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-6 w-6 mr-2 text-yellow-500" />
              Payment Session Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              We couldn't find the payment session you're looking for. It may have expired or been processed already.
            </p>
            
            <Button onClick={handleCancel} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="h-6 w-6 mr-2" />
            ZaloPay Payment Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentStatus === 'PENDING' && (
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
          )}

          {paymentStatus === 'CREATED' && (
            <div className="text-center py-8">
              <div className="animate-pulse">
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Created</h3>
              <p className="text-gray-600">
                Your payment has been created but not yet processed. Please complete the payment through ZaloPay.
              </p>
              <div className="mt-4">
                <Button onClick={handleRetry} className="bg-blue-600 hover:bg-blue-700">
                  Check Payment Status
                </Button>
              </div>
            </div>
          )}

          {/* Payment Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Details</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment ID:</span>
                <span className="font-medium">{paymentSession.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">{paymentSession.amount.toLocaleString()} {paymentSession.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  paymentStatus === 'PAID' ? 'text-green-600' : 
                  paymentStatus === 'PENDING' ? 'text-orange-600' : 
                  'text-red-600'
                }`}>
                  {paymentStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-medium">
                  {new Date(paymentSession.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Expires:</span>
                <span className="font-medium">
                  {new Date(paymentSession.expiresAt).toLocaleString()}
                </span>
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
                  Your payment is being processed securely through ZaloPay. 
                  Do not refresh or close this page until the process is complete.
                </p>
              </div>
            </div>
          </div>

          {/* Cancel Option */}
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              Cancel and Return to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 