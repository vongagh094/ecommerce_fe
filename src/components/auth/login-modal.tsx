"use client"

import type React from "react"

import { useState } from "react"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useAuth0 } from "@auth0/auth0-react"

interface LoginModalProps {
	isOpen: boolean
	onClose: () => void
	onLogin?: () => void // optional callback for backward-compatibility
	onSwitchToSignup: () => void
}

export function LoginModal({ isOpen, onClose, onLogin, onSwitchToSignup }: LoginModalProps) {
	// no local form state; using Auth0 Universal Login
	const [loading, setLoading] = useState<"none" | "google" | "email">("none")
	const { loginWithRedirect } = useAuth0()

	const currentReturnTo = typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}${window.location.hash}` : '/'

	const saveReturnUrl = () => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('auth_return_url', currentReturnTo)
		}
	}

	const handleEmailLogin = async () => {
		try {
			setLoading("email")
			saveReturnUrl()
			await loginWithRedirect({
				appState: { returnTo: currentReturnTo },
			})
			onLogin?.()
		} finally {
			setLoading("none")
		}
	}

	const handleGoogleLogin = async () => {
		try {
			setLoading("google")
			saveReturnUrl()
			await loginWithRedirect({
				appState: { returnTo: currentReturnTo },
				authorizationParams: { connection: "google-oauth2" },
			})
			onLogin?.()
		} finally {
			setLoading("none")
		}
	}

	// No traditional form submit; handled by buttons above

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="sm:max-w-md p-0 gap-0">
				<div className="p-6">
					{/* Header */}
					<div className="flex items-center justify-between mb-8">
						<Button variant="ghost" size="sm" onClick={onClose} className="p-0 h-auto">
							<ArrowLeft className="h-4 w-4" />
						</Button>
						<h2 className="text-lg font-semibold">Log In</h2>
						<div className="w-4" />
					</div>

					{/* Social Login */}
					<Button
						onClick={handleGoogleLogin}
						disabled={loading === "google"}
						className="w-full h-14 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 font-semibold rounded-lg text-base flex items-center justify-center space-x-3"
					>
						{loading === "google" ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="h-4 w-4" />
						)}
						<span>Continue with Google</span>
					</Button>

					<div className="my-6 flex items-center justify-center">
						<span className="text-xs text-gray-500 uppercase tracking-wider">or</span>
					</div>

					{/* Email login triggers Auth0 universal login */}
					<Button
						onClick={handleEmailLogin}
						disabled={loading === "email"}
						className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg text-base"
					>
						{loading === "email" && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
						Continue with Email
					</Button>

					{/* Switch to Signup */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600">
							Don't have an account?{" "}
							<button onClick={onSwitchToSignup} className="text-blue-500 hover:text-blue-600 font-medium">
								Sign up
							</button>
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	)
}
