"use client"
import { useAuth0 } from "@auth0/auth0-react"

export default function PaymentConfirmationPage() {
	const { user } = useAuth0()
	return <div>Payment confirmation for {user?.name}</div>
} 