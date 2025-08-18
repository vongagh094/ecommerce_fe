"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"  // removed form inputs
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth0 } from "@auth0/auth0-react"

interface SignupModalProps {
	isOpen: boolean
	onClose: () => void
	onSignup?: () => void // optional
	onSwitchToLogin: () => void
}

export function SignupModal({ isOpen, onClose, onSignup, onSwitchToLogin }: SignupModalProps) {
	const [loading, setLoading] = useState(false)
	const { loginWithRedirect } = useAuth0()

	const handleSignup = async () => {
		try {
			setLoading(true)
			await loginWithRedirect({
				appState: { returnTo: "/" },
				authorizationParams: { screen_hint: "signup" as any },
			})
			onSignup?.()
		} finally {
			setLoading(false)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md p-0 gap-0">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<Button variant="ghost" size="sm" onClick={onClose} className="p-0 h-auto">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h2 className="text-lg font-semibold">Sign up</h2>
						<div className="w-4" />
					</div>

					<Button
						onClick={handleSignup}
						disabled={loading}
						className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-base flex items-center justify-center"
					>
						{loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
						Continue to Sign up / Login
					</Button>

					{/* Switch to Login */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Already have an account?{" "}
							<button onClick={onSwitchToLogin} className="text-blue-500 hover:text-blue-600 font-medium">
								Log in
							</button>
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
