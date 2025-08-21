"use client"

import { useState, useRef, useEffect } from "react"
import { Menu, User, Bell, Heart, MapPin, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"
import { useRouter } from "next/navigation"
import { useAuth0 } from "@auth0/auth0-react"

export function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0()

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } })
    setIsOpen(false)
    router.push("/")
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <>
      <div className="relative" ref={menuRef}>
        {/* Trigger Button */}
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow bg-white"
        >
          <Menu className="h-4 w-4 text-gray-600" />
          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        </Button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-60 bg-gray-100 border border-gray-200 rounded-2xl shadow-lg z-50 p-4">
            {!isAuthenticated ? (
              // Non-logged-in user menu
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowLoginModal(true)
                    setIsOpen(false)
                  }}
                  className="w-full py-3 px-6 bg-white border-2 border-black rounded-full text-black font-semibold hover:bg-gray-50 transition-colors"
                >
                  Log in
                </button>
                <button
                  onClick={() => {
                    setShowSignupModal(true)
                    setIsOpen(false)
                  }}
                  className="w-full py-3 px-6 bg-white border-2 border-black rounded-full text-black font-semibold hover:bg-gray-50 transition-colors"
                >
                  Sign up
                </button>
              </div>
            ) : (
              // Logged-in user menu
              <div className="space-y-2">
                <button
                  onClick={() => {
                    router.push("/dashboard")
                    setIsOpen(false)
                  }}
                  className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-3"
                >
                  <User className="h-4 w-4" />
                  <span>User information</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/notifications")
                    setIsOpen(false)
                  }}
                  className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-3"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/wishlists")
                    setIsOpen(false)
                  }}
                  className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-3"
                >
                  <Heart className="h-4 w-4" />
                  <span>Wishlists</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/trips")
                    setIsOpen(false)
                  }}
                  className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-3"
                >
                  <MapPin className="h-4 w-4" />
                  <span>Your trips</span>
                </button>
                <button
                  onClick={() => {
                    router.push("/dashboard/messages")
                    setIsOpen(false)
                  }}
                  className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-3"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Messages</span>
                </button>
                <hr className="my-2 border-gray-300" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left py-3 px-3 rounded-lg hover:bg-gray-200 transition-colors text-gray-600"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={() => loginWithRedirect({ appState: { returnTo: "/" } })}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={() => loginWithRedirect({ appState: { returnTo: "/" } })}
        onSwitchToLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />
    </>
  )
}
