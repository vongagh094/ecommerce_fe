"use client"

import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/shared/user-menu"
import { NotificationDropdown } from "@/components/shared/notification-dropdown"
import { SearchBar } from "@/components/shared/search-bar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"
import { useState } from "react"

export function PropertyHeader() {
  const router = useRouter()
  const { isLoggedIn, login } = useAuth()

  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  const handleHostToggle = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    router.push("/host")
  }

  const handleLogin = () => {
    const userData = {
      id: "1",
      name: "Moni Roy",
      email: "jaskolski.brent@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    }
    login(userData)
    setShowLoginModal(false)
    router.push("/host")
  }

  const handleSignup = () => {
    const userData = {
      id: "1",
      name: "Moni Roy",
      email: "jaskolski.brent@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    }
    login(userData)
    setShowSignupModal(false)
    router.push("/host")
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-800 font-serif">Sky-high</h1>
            <p className="text-xs text-gray-500 ml-2 mt-1">YOUR HOLIDAY</p>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex">
            <SearchBar />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-sm font-semibold" onClick={handleHostToggle}>
              Become a host
            </Button>
            {isLoggedIn && <NotificationDropdown />}
            <UserMenu />
          </div>
        </div>
      </div>
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />

      {/* Signup Modal */}
      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onSignup={handleSignup}
        onSwitchToLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />
    </header>
  )
}
