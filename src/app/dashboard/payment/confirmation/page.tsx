"use client"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useAuth0 } from "@auth0/auth0-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { paymentApi } from "@/lib/api/payment"

export default function PaymentConfirmationPage() {
	const { user } = useAuth0()
	const params = useSearchParams()
	const router = useRouter()

	const transactionId = params.get('transactionId')
	const sessionId = params.get('sessionId')

	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [booking, setBooking] = useState<any | null>(null)

	useEffect(() => {
		const run = async () => {
			try {
				setIsLoading(true)
				setError(null)

				if (process.env.NEXT_PUBLIC_PAYMENT_MOCK === '1') {
					// Fabricate a booking in mock mode
					setTimeout(() => {
						setBooking({
							id: `bk_${Date.now()}`,
							propertyName: 'Demo Property',
							checkIn: new Date().toISOString().split('T')[0],
							checkOut: new Date(Date.now() + 2*24*60*60*1000).toISOString().split('T')[0],
							totalAmount: 1230000,
							transactionId,
							sessionId,
						})
						setIsLoading(false)
					}, 600)
					return
				}

				// Real mode: optionally fetch booking details by payment
				if (transactionId) {
					// If backend exposes booking by transaction or via session, fetch here
					// For now we just mark success without details
					setBooking({ id: transactionId, transactionId, sessionId })
				}
			} catch (e) {
				setError('Failed to load confirmation details.')
			} finally {
				setIsLoading(false)
			}
		}
		run()
	}, [transactionId, sessionId])

	if (isLoading) {
		return (
			<div className="flex justify-center items-center min-h-[60vh]">
				<LoadingSpinner message="Finalizing your booking..." />
			</div>
		)
	}

	if (error) {
		return (
			<div className="max-w-3xl mx-auto p-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<AlertCircle className="h-6 w-6 mr-2 text-red-500" />
							Payment Confirmation
						</CardTitle>
					</CardHeader>
					<CardContent>
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{error}</AlertDescription>
						</Alert>
					</CardContent>
				</Card>
			</div>
		)
	}

	return (
		<div className="max-w-3xl mx-auto p-6">
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<CheckCircle className="h-6 w-6 mr-2 text-green-600" />
						Payment Confirmed
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<p className="text-gray-700">Thank you{user?.name ? `, ${user.name}` : ''}! Your payment has been processed successfully.</p>
					<div className="bg-gray-50 rounded p-4 space-y-2">
						<div className="flex justify-between">
							<span className="text-gray-600">Transaction ID</span>
							<span className="font-medium">{transactionId}</span>
						</div>
						{sessionId && (
							<div className="flex justify-between">
								<span className="text-gray-600">Session ID</span>
								<span className="font-medium">{sessionId}</span>
							</div>
						)}
						{booking && booking.propertyName && (
							<div className="flex justify-between">
								<span className="text-gray-600">Property</span>
								<span className="font-medium">{booking.propertyName}</span>
							</div>
						)}
						{booking && booking.totalAmount && (
							<div className="flex justify-between">
								<span className="text-gray-600">Total</span>
								<span className="font-medium">{booking.totalAmount.toLocaleString()} VND</span>
							</div>
						)}
					</div>
					<div className="pt-2">
						<Button onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
} 