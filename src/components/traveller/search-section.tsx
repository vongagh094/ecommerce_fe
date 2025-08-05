"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/shared/user-menu"
import { NotificationDropdown } from "@/components/shared/notification-dropdown"
import { SearchBar } from "@/components/shared/search-bar"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"

type SearchSectionProps = {
  onSearchResults: (results: any) => void
}

export function SearchSection({onSearchResults}: SearchSectionProps) {
  const [userType, setUserType] = useState<"traveller" | "host">("traveller")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const router = useRouter()
  const { isLoggedIn, login } = useAuth()

  const handleUserTypeToggle = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }


    const newUserType = userType === "traveller" ? "host" : "traveller"
    setUserType(newUserType)

    if (newUserType === "host") {
      router.push("/host")
    } else {
      router.push("/")
    }
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
    // After login, redirect to host page
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
    // After signup, redirect to host page
    router.push("/host")
  }

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-800 font-serif">Sky-high</h1>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex">
            <SearchBar onSearchResults={onSearchResults}/>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-sm font-semibold" onClick={handleUserTypeToggle}>
              {userType === "traveller" ? "Become a host" : "Switch to travelling"}
            </Button>
            {isLoggedIn && <NotificationDropdown />}
            <UserMenu />
          </div>
        </div>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLogin={handleLogin}
        onSwitchToSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />
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
