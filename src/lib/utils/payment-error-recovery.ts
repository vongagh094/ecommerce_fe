/**
 * Payment Error Recovery System
 * Advanced error classification, recovery strategies, and user guidance
 */

import { PaymentError } from '@/types/payment'

// Error types for classification
export enum PaymentErrorType {
  // Network errors
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  
  // API errors
  SERVER_ERROR = 'SERVER_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  
  // Payment errors
  PAYMENT_CREATION_FAILED = 'PAYMENT_CREATION_FAILED',
  PAYMENT_VERIFICATION_FAILED = 'PAYMENT_VERIFICATION_FAILED',
  PAYMENT_CANCELLED = 'PAYMENT_CANCELLED',
  PAYMENT_EXPIRED = 'PAYMENT_EXPIRED',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  
  // Validation errors
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_TRANSACTION_ID = 'INVALID_TRANSACTION_ID',
  
  // System errors
  BOOKING_CREATION_FAILED = 'BOOKING_CREATION_FAILED',
  CALENDAR_UPDATE_FAILED = 'CALENDAR_UPDATE_FAILED',
  EMAIL_SENDING_FAILED = 'EMAIL_SENDING_FAILED',
  
  // Fallback
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Recovery actions
export enum RecoveryAction {
  RETRY = 'RETRY',
  VERIFY_STATUS = 'VERIFY_STATUS',
  SHOW_ERROR = 'SHOW_ERROR',
  RETURN_TO_SELECTION = 'RETURN_TO_SELECTION',
  CONTACT_SUPPORT = 'CONTACT_SUPPORT'
}

// Error recovery strategy
export interface ErrorRecoveryStrategy {
  action: RecoveryAction
  message: string
  canRetry: boolean
  retryDelay?: number
  maxRetries?: number
}

// Error classification result
export interface ClassifiedError {
  type: PaymentErrorType
  message: string
  originalError: any
  recovery: ErrorRecoveryStrategy
}

export class PaymentErrorRecovery {
  // Classify error by type and provide recovery strategy
  static classifyError(error: any): ClassifiedError {
    // Handle known PaymentError instances
    if (error instanceof PaymentError) {
      return PaymentErrorRecovery.classifyPaymentError(error)
    }
    
    // Handle network errors
    if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
      return {
        type: PaymentErrorType.NETWORK_ERROR,
        message: 'Network connection issue. Please check your internet connection.',
        originalError: error,
        recovery: {
          action: RecoveryAction.RETRY,
          message: 'Please check your internet connection and try again.',
          canRetry: true,
          retryDelay: 2000,
          maxRetries: 3
        }
      }
    }
    
    // Handle timeout errors
    if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
      return {
        type: PaymentErrorType.TIMEOUT,
        message: 'The request timed out. Please try again.',
        originalError: error,
        recovery: {
          action: RecoveryAction.RETRY,
          message: 'The server is taking longer than expected to respond. Please try again.',
          canRetry: true,
          retryDelay: 3000,
          maxRetries: 2
        }
      }
    }
    
    // Handle HTTP status codes
    if (error?.status) {
      // Server errors (5xx)
      if (error.status >= 500) {
        return {
          type: PaymentErrorType.SERVER_ERROR,
          message: 'Server error. Please try again later.',
          originalError: error,
          recovery: {
            action: RecoveryAction.RETRY,
            message: 'The server encountered an error. Please try again in a moment.',
            canRetry: true,
            retryDelay: 5000,
            maxRetries: 3
          }
        }
      }
      
      // Rate limiting (429)
      if (error.status === 429) {
        return {
          type: PaymentErrorType.RATE_LIMIT,
          message: 'Too many requests. Please wait a moment.',
          originalError: error,
          recovery: {
            action: RecoveryAction.RETRY,
            message: 'You\'ve made too many requests. Please wait a moment before trying again.',
            canRetry: true,
            retryDelay: 10000,
            maxRetries: 1
          }
        }
      }
      
      // Client errors (4xx)
      if (error.status >= 400 && error.status < 500) {
        return {
          type: PaymentErrorType.UNKNOWN_ERROR,
          message: 'Request error. Please check your information.',
          originalError: error,
          recovery: {
            action: RecoveryAction.SHOW_ERROR,
            message: 'There was a problem with your request. Please check your information and try again.',
            canRetry: false
          }
        }
      }
    }
    
    // Default unknown error
    return {
      type: PaymentErrorType.UNKNOWN_ERROR,
      message: 'An unexpected error occurred.',
      originalError: error,
      recovery: {
        action: RecoveryAction.SHOW_ERROR,
        message: 'An unexpected error occurred. Please try again or contact support if the problem persists.',
        canRetry: false
      }
    }
  }
  
  // Classify payment-specific errors
  private static classifyPaymentError(error: PaymentError): ClassifiedError {
    switch (error.code) {
      case 'PAYMENT_CREATION_FAILED':
        return {
          type: PaymentErrorType.PAYMENT_CREATION_FAILED,
          message: 'Failed to create payment.',
          originalError: error,
          recovery: {
            action: RecoveryAction.RETRY,
            message: 'Unable to create payment. Please try again.',
            canRetry: true,
            retryDelay: 2000,
            maxRetries: 3
          }
        }
        
      case 'PAYMENT_VERIFICATION_FAILED':
        return {
          type: PaymentErrorType.PAYMENT_VERIFICATION_FAILED,
          message: 'Failed to verify payment status.',
          originalError: error,
          recovery: {
            action: RecoveryAction.VERIFY_STATUS,
            message: 'We\'re having trouble verifying your payment. Please wait while we check the status.',
            canRetry: true,
            retryDelay: 3000,
            maxRetries: 5
          }
        }
        
      case 'PAYMENT_CANCELLED':
        return {
          type: PaymentErrorType.PAYMENT_CANCELLED,
          message: 'Payment was cancelled.',
          originalError: error,
          recovery: {
            action: RecoveryAction.RETURN_TO_SELECTION,
            message: 'Your payment was cancelled. You can try again when you\'re ready.',
            canRetry: false
          }
        }
        
      case 'PAYMENT_EXPIRED':
        return {
          type: PaymentErrorType.PAYMENT_EXPIRED,
          message: 'Payment session expired.',
          originalError: error,
          recovery: {
            action: RecoveryAction.RETURN_TO_SELECTION,
            message: 'Your payment session has expired. Please start again.',
            canRetry: false
          }
        }
        
      case 'INVALID_AMOUNT':
        return {
          type: PaymentErrorType.INVALID_AMOUNT,
          message: 'Invalid payment amount.',
          originalError: error,
          recovery: {
            action: RecoveryAction.SHOW_ERROR,
            message: 'The payment amount is invalid. Please contact support.',
            canRetry: false
          }
        }
        
      case 'INSUFFICIENT_FUNDS':
        return {
          type: PaymentErrorType.INSUFFICIENT_FUNDS,
          message: 'Insufficient funds for payment.',
          originalError: error,
          recovery: {
            action: RecoveryAction.SHOW_ERROR,
            message: 'Your payment method has insufficient funds. Please try a different payment method.',
            canRetry: false
          }
        }
        
      case 'BOOKING_CREATION_FAILED':
        return {
          type: PaymentErrorType.BOOKING_CREATION_FAILED,
          message: 'Failed to create booking after payment.',
          originalError: error,
          recovery: {
            action: RecoveryAction.CONTACT_SUPPORT,
            message: 'Your payment was successful, but we encountered an issue creating your booking. Our team has been notified and will resolve this shortly.',
            canRetry: false
          }
        }
        
      default:
        return {
          type: PaymentErrorType.UNKNOWN_ERROR,
          message: error.message || 'An unexpected payment error occurred.',
          originalError: error,
          recovery: {
            action: RecoveryAction.SHOW_ERROR,
            message: 'An unexpected error occurred with your payment. Please try again or contact support.',
            canRetry: false
          }
        }
    }
  }
  
  // Execute recovery strategy
  static async executeRecovery(
    error: ClassifiedError,
    retryCallback?: () => Promise<any>,
    verifyCallback?: () => Promise<any>,
    returnCallback?: () => void,
    showErrorCallback?: (message: string) => void,
    contactSupportCallback?: () => void
  ): Promise<any> {
    const { recovery } = error
    
    switch (recovery.action) {
      case RecoveryAction.RETRY:
        if (retryCallback) {
          try {
            return await retryCallback()
          } catch (retryError) {
            // If we've reached max retries, show error
            const retriesLeft = (recovery.maxRetries || 0) - 1
            if (retriesLeft <= 0) {
              if (showErrorCallback) {
                showErrorCallback(`${recovery.message} (Max retries reached)`)
              }
              throw retryError
            }
            
            // Update recovery strategy with decremented retries
            const updatedError = {
              ...error,
              recovery: {
                ...recovery,
                maxRetries: retriesLeft
              }
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, recovery.retryDelay || 2000))
            
            // Recursive retry with updated error
            return PaymentErrorRecovery.executeRecovery(
              updatedError,
              retryCallback,
              verifyCallback,
              returnCallback,
              showErrorCallback,
              contactSupportCallback
            )
          }
        }
        break
        
      case RecoveryAction.VERIFY_STATUS:
        if (verifyCallback) {
          return verifyCallback()
        }
        break
        
      case RecoveryAction.RETURN_TO_SELECTION:
        if (returnCallback) {
          returnCallback()
        }
        break
        
      case RecoveryAction.CONTACT_SUPPORT:
        if (contactSupportCallback) {
          contactSupportCallback()
        }
        if (showErrorCallback) {
          showErrorCallback(recovery.message)
        }
        break
        
      case RecoveryAction.SHOW_ERROR:
      default:
        if (showErrorCallback) {
          showErrorCallback(recovery.message)
        }
        break
    }
    
    throw error.originalError
  }
  
  // Log error for monitoring and analytics
  static logError(error: ClassifiedError): void {
    // In a real implementation, this would send error data to a monitoring service
    console.error(`[PaymentError] Type: ${error.type}, Message: ${error.message}`, error.originalError)
    
    // Example of what would happen in production:
    // errorMonitoringService.captureException({
    //   type: error.type,
    //   message: error.message,
    //   originalError: error.originalError,
    //   timestamp: new Date().toISOString(),
    //   recoveryAction: error.recovery.action
    // })
  }
}