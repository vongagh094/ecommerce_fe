"use client"

import { Map } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/shared/user-menu"
import { NotificationDropdown } from "@/components/shared/notification-dropdown"
import { SearchBar } from "@/components/shared/search-bar"
import Link from "next/link"
import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface SearchResultsHeaderProps {
  searchData: {
    location: string
    checkIn: Date | null
    checkOut: Date | null
    guests: number
  }
  showMap: boolean
  onToggleMap: () => void
}

export function SearchResultsHeader({ searchData, showMap, onToggleMap }: SearchResultsHeaderProps) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const { isLoggedIn, login } = useAuth()
  const router = useRouter()

  const handleBecomeHost = () => {
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
          </Link>

          {/* Search Bar - Compact Version */}
          <div className="hidden md:flex">
            <SearchBar variant="compact" />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-sm font-semibold" onClick={handleBecomeHost}>
              Become a host
            </Button>
            <Button variant="outline" onClick={onToggleMap} className="hidden lg:flex items-center space-x-2">
              <Map className="h-4 w-4" />
              <span>{showMap ? "Hide map" : "Show map"}</span>
            </Button>
            <NotificationDropdown />
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
