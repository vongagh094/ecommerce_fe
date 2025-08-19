"use client"

import { useMemo, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ZaloPayPayment } from "@/components/payment/zalopay-payment"
import type { BookingDetails } from "@/types/payment"
import { paymentApi } from "@/lib/api/payment"

export default function InstantPaymentPage() {
	const params = useSearchParams()
	const router = useRouter()

	const bookingDetails: BookingDetails | null = useMemo(() => {
		const propertyId = params.get('propertyId') || ''
		const propertyName = params.get('propertyName') || ''
		const checkIn = params.get('checkIn') || ''
		const checkOut = params.get('checkOut') || ''
		const guestCount = Number(params.get('guestCount') || '1')
		const selectedNightsRaw = params.get('selectedNights') || ''
		const selectedNights = selectedNightsRaw ? selectedNightsRaw.split(',') : []
		if (!propertyId || !propertyName || !checkIn || !checkOut || selectedNights.length === 0) return null
		return {
			auctionId: propertyId, // reuse field to align with existing API; backend can treat as property-only flow
			propertyId,
			propertyName,
			checkIn,
			checkOut,
			selectedNights,
			guestCount,
		}
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.toString()])

	useEffect(() => {
		const appTransId = params.get('appTransId') || ''
		if (!appTransId) return
		let cancelled = false
		const poll = async (attempt = 0) => {
			try {
				const response = await paymentApi.verifyPayment(appTransId)
				if (cancelled) return
				if (response.status === 'PAID') {
					router.push(`/dashboard/payment/confirmation?transactionId=${response.transactionId || appTransId}`)
					return
				}
				if (response.status === 'FAILED') {
					// stay on page; user can retry
					return
				}
				if (attempt < 10) setTimeout(() => poll(attempt + 1), 3000)
			} catch (e) {
				if (attempt < 10) setTimeout(() => poll(attempt + 1), 3000)
			}
		}
		poll()
		return () => { cancelled = true }
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [params.toString(), router])

	const amount = useMemo(() => Number(params.get('amount') || '0'), [params])

	if (!bookingDetails || !amount) {
		return (
			<div className="max-w-3xl mx-auto p-6">
				<p className="text-gray-700">Missing booking details. Please go back and select your dates.</p>
			</div>
		)
	}

	return (
		<div className="max-w-4xl mx-auto p-6">
			<ZaloPayPayment
				bookingDetails={bookingDetails}
				amount={amount}
				onPaymentSuccess={(transactionId) => {
					router.push(`/dashboard/payment/confirmation?transactionId=${transactionId}`)
				}}
				onPaymentError={() => router.back()}
				onPaymentCancel={() => router.back()}
			/>
		</div>
	)
} 