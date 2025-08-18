"use client"

import { useState, useEffect, ReactNode } from "react"
import { AlertCircle, RefreshCw, ArrowLeft, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PaymentErrorRecovery, PaymentErrorType, RecoveryAction } from "@/lib/utils/payment-error-recovery"

interface PaymentErrorBoundaryProps {
  children: ReactNode
  onRetry?: () => void
  onReturn?: () => void
  onContactSupport?: () => void
  fallbackComponent?: ReactNode
}

export function PaymentErrorBoundary({
  children,
  onRetry,
  onReturn,
  onContactSupport,
  fallbackComponent
}: PaymentErrorBoundaryProps) {
  const [error, setError] = useState<any>(null)
  const [errorInfo, setErrorInfo] = useState<any>(null)
  
  // Reset error state on retry
  useEffect(() => {
    if (onRetry) {
      const originalOnRetry = onRetry
      onRetry = () => {
        setError(null)
        setErrorInfo(null)
        originalOnRetry()
      }
    }
  }, [onRetry])
  
  // Error handling
  const handleError = (error: Error, errorInfo: any) => {
    // Classify the error
    const classifiedError = PaymentErrorRecovery.classifyError(error)
    
    // Log the error
    PaymentErrorRecovery.logError(classifiedError)
    
    // Set error state
    setError(classifiedError)
    setErrorInfo(errorInfo)
  }
  
  // Automatic recovery attempt
  useEffect(() => {
    if (error && error.recovery) {
      const attemptRecovery = async () => {
        try {
          await PaymentErrorRecovery.executeRecovery(
            error,
            onRetry,
            undefined, // No verify callback in this component
            onReturn,
            undefined, // We'll handle showing errors ourselves
            onContactSupport
          )
          
          // If recovery was successful, clear the error
          setError(null)
          setErrorInfo(null)
        } catch (recoveryError) {
          // Recovery failed, keep the error state
          console.error("Recovery failed:", recoveryError)
        }
      }
      
      // Only attempt automatic recovery for network errors
      if (error.type === PaymentErrorType.NETWORK_ERROR || 
          error.type === PaymentErrorType.SERVER_ERROR) {
        attemptRecovery()
      }
    }
  }, [error, onRetry, onReturn, onContactSupport])
  
  // If there's an error, show the fallback UI
  if (error) {
    // If a custom fallback component is provided, use it
    if (fallbackComponent) {
      return <>{fallbackComponent}</>
    }
    
    // Default fallback UI
    return (
      <Card className="border-red-200 max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            Payment Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.recovery?.message || "An unexpected error occurred during payment processing."}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-wrap gap-3">
            {error.recovery?.action === RecoveryAction.RETRY && onRetry && (
              <Button 
                onClick={onRetry}
                className="flex items-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {error.recovery?.action === RecoveryAction.RETURN_TO_SELECTION && onReturn && (
              <Button 
                onClick={onReturn}
                variant="outline"
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            )}
            
            {(error.recovery?.action === RecoveryAction.CONTACT_SUPPORT || 
             error.recovery?.action === RecoveryAction.SHOW_ERROR) && 
             onContactSupport && (
              <Button 
                onClick={onContactSupport}
                variant="outline"
                className="flex items-center"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            )}
            
            {/* Always show return button if available */}
            {onReturn && error.recovery?.action !== RecoveryAction.RETURN_TO_SELECTION && (
              <Button 
                onClick={onReturn}
                variant="ghost"
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            )}
          </div>
          
          {/* Technical details (only in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md overflow-auto text-xs">
              <p className="font-bold mb-2">Error Details (Development Only):</p>
              <pre className="whitespace-pre-wrap">
                {JSON.stringify({
                  type: error.type,
                  message: error.message,
                  componentStack: errorInfo?.componentStack,
                  recovery: error.recovery
                }, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }
  
  // If there's no error, render children
  try {
    return <>{children}</>
  } catch (error: any) {
    handleError(error, { componentStack: error?.stack })
    return null
  }
} 