/**
 * Payment Utilities Demo
 * Demonstrates the functionality of payment utilities and helpers
 */

import { PaymentCalculator, ZaloPayUrlUtils, PaymentSessionManager, PaymentErrorClassifier } from './payment-utils'
import { ZaloPayHelper } from './zalopay-helpers'
import { PaymentError } from '@/types/payment'

/**
 * Demo function to showcase payment utilities
 */
export function demonstratePaymentUtils() {
    console.log('=== Payment Utilities Demo ===\n')

    // 1. Payment Calculation Demo
    console.log('1. Payment Calculation:')
    const nights = [
        { date: '2024-01-01', pricePerNight: 100000 },
        { date: '2024-01-02', pricePerNight: 120000 },
        { date: '2024-01-03', pricePerNight: 110000 }
    ]

    const totalAmount = PaymentCalculator.calculateTotalAmount(nights)
    console.log(`Total amount for ${nights.length} nights: ${PaymentCalculator.formatAmount(totalAmount)}`)

    const breakdown = PaymentCalculator.calculatePaymentBreakdown(totalAmount, {
        taxRate: 0.1,
        serviceFee: 5000,
        discountPercent: 5
    })
    console.log('Payment breakdown:', breakdown)
    console.log(`Final amount: ${PaymentCalculator.formatAmount(breakdown.totalAmount)}\n`)

    // 2. Amount Validation Demo
    console.log('2. Amount Validation:')
    const validAmount = PaymentCalculator.validateAmount(100000)
    const invalidAmount = PaymentCalculator.validateAmount(60000000)
    console.log(`100,000 VND is valid: ${validAmount.isValid}`)
    console.log(`60,000,000 VND is valid: ${invalidAmount.isValid} (${invalidAmount.error})\n`)

    // 3. ZaloPay URL Utils Demo
    console.log('3. ZaloPay URL Utilities:')
    const appTransId = ZaloPayUrlUtils.generateAppTransId('123', 'AUCTION')
    console.log(`Generated app_trans_id: ${appTransId}`)

    const validation = ZaloPayUrlUtils.validateAppTransId(appTransId)
    console.log(`App trans ID is valid: ${validation.isValid}`)

    const parsed = ZaloPayUrlUtils.parseAppTransId(appTransId)
    console.log('Parsed components:', parsed)

    const orderUrl = 'https://sb-zalopay.vn/order/token123'
    const urlValidation = ZaloPayUrlUtils.validateOrderUrl(orderUrl)
    console.log(`Order URL is valid: ${urlValidation.isValid}\n`)

    // 4. Payment Session Demo
    console.log('4. Payment Session Management:')
    const session = PaymentSessionManager.createSession(
        'auction123',
        'user456',
        totalAmount,
        appTransId
    )
    console.log(`Created session: ${session.id}`)
    console.log(`Session expires at: ${session.expiresAt}`)
    console.log(`Remaining time: ${PaymentSessionManager.formatRemainingTime(session)}`)

    const sessionValidation = PaymentSessionManager.isSessionValidForPayment(session)
    console.log(`Session is valid for payment: ${sessionValidation.isValid}\n`)

    // 5. Error Classification Demo
    console.log('5. Error Classification:')
    const paymentError = new PaymentError('INVALID_AMOUNT', 'Amount is too high')
    const classification = PaymentErrorClassifier.classifyError(paymentError)
    console.log('Payment error classification:', {
        category: classification.category,
        severity: classification.severity,
        isRetryable: classification.isRetryable,
        userMessage: classification.userMessage
    })

    const networkError = new Error('Network connection failed')
    const networkClassification = PaymentErrorClassifier.classifyError(networkError)
    console.log('Network error classification:', {
        category: networkClassification.category,
        severity: networkClassification.severity,
        isRetryable: networkClassification.isRetryable
    })

    const recoveryStrategy = PaymentErrorClassifier.getRecoveryStrategy(networkError)
    console.log('Recovery strategy for network error:', {
        action: recoveryStrategy.action,
        maxRetries: recoveryStrategy.maxRetries
    })

    console.log('\n=== Demo Complete ===')
}

/**
 * Demo ZaloPay helper functionality
 */
export function demonstrateZaloPayHelpers() {
    console.log('=== ZaloPay Helpers Demo ===\n')

    const config = {
        appId: '123',
        key1: 'test_key_1',
        key2: 'test_key_2',
        endpoint: 'https://sb-openapi.zalopay.vn/v2',
        callbackUrl: 'https://example.com/callback',
        redirectUrl: 'https://example.com/redirect'
    }

    const helper = new ZaloPayHelper(config)

    // Generate order data
    const orderData = helper.generateOrderData({
        appTransId: ZaloPayHelper.generateAppTransId('123', 'DEMO'),
        userId: 'user123',
        amount: 100000,
        description: 'Demo payment',
        propertyName: 'Beautiful Villa',
        checkIn: '2024-01-01',
        checkOut: '2024-01-03'
    })

    console.log('Generated ZaloPay order data:')
    console.log(`App ID: ${orderData.app_id}`)
    console.log(`App Trans ID: ${orderData.app_trans_id}`)
    console.log(`Amount: ${orderData.amount}`)
    console.log(`Description: ${orderData.description}`)
    console.log(`MAC: ${orderData.mac.substring(0, 20)}...`)

    // Validate amount
    const amountValidation = ZaloPayHelper.validateAmount(100000)
    console.log(`\nAmount validation: ${amountValidation.isValid}`)

    // Format amount
    const formattedAmount = ZaloPayHelper.formatAmount(100000.5)
    console.log(`Formatted amount: ${formattedAmount}`)

    // Environment URLs
    const urls = ZaloPayHelper.getEnvironmentUrls(false)
    console.log(`\nSandbox URLs:`)
    console.log(`API URL: ${urls.apiUrl}`)
    console.log(`Gateway URL: ${urls.gatewayUrl}`)

    console.log('\n=== ZaloPay Demo Complete ===')
}

// Export demo functions for use in development
if (typeof window === 'undefined' && process.env.NODE_ENV === 'development') {
    // Only run in Node.js development environment
    // demonstratePaymentUtils()
    // demonstrateZaloPayHelpers()
}