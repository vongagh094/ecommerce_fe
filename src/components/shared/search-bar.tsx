"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { LocationSearchModal } from "@/components/traveller/search/location-search-modal"
import { DatePickerModal } from "@/components/traveller/search/date-picker-modal"
import { GuestSelectorModal, type GuestCounts } from "@/components/traveller/search/guest-selector-modal"
import { useRouter, useSearchParams } from "next/navigation"
import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"
import { useAuth } from "@/contexts/auth-context"

interface SearchBarProps {
  variant?: "default" | "compact"
  className?: string
}

export function SearchBar({ variant = "default", className = "" }: SearchBarProps) {
  const [activeModal, setActiveModal] = useState<"location" | "dates" | "guests" | null>(null)
  const [searchData, setSearchData] = useState({
    location: "",
    checkIn: null as Date | null,
    checkOut: null as Date | null,
    guests: { adults: 1, children: 0, infants: 0, pets: 0 } as GuestCounts,
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const { isLoggedIn, login } = useAuth()

  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize search data from URL params only once
  useEffect(() => {
    if (!isInitialized) {
      const location = searchParams.get("location")
      const checkIn = searchParams.get("checkIn")
      const checkOut = searchParams.get("checkOut")
      const guests = searchParams.get("guests")

      if (location || checkIn || checkOut || guests) {
        setSearchData({
          location: location || "",
          checkIn: checkIn ? new Date(checkIn) : null,
          checkOut: checkOut ? new Date(checkOut) : null,
          guests: {
            adults: guests ? Math.max(1, Number.parseInt(guests)) : 1,
            children: 0,
            infants: 0,
            pets: 0,
          },
        })
      }
      setIsInitialized(true)
    }
  }, [searchParams, isInitialized])

  const handleSearch = useCallback(() => {
    // Create search params
    const params = new URLSearchParams()
    if (searchData.location) params.set("location", searchData.location)
    if (searchData.checkIn) params.set("checkIn", searchData.checkIn.toISOString())
    if (searchData.checkOut) params.set("checkOut", searchData.checkOut.toISOString())
    params.set("guests", (searchData.guests.adults + searchData.guests.children).toString())

    router.push(`/search?${params.toString()}`)
    setActiveModal(null)
  }, [searchData, router])

  const formatGuests = useCallback(() => {
    const total = searchData.guests.adults + searchData.guests.children
    if (total === 1) return "1 guest"
    return `${total} guests`
  }, [searchData.guests])

  const formatDateRange = useCallback(() => {
    if (!searchData.checkIn || !searchData.checkOut) return "Add dates"

    const checkInStr = searchData.checkIn.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
    const checkOutStr = searchData.checkOut.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })

    return `${checkInStr} - ${checkOutStr}`
  }, [searchData.checkIn, searchData.checkOut])

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setActiveModal(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleLocationSelect = useCallback((location: string) => {
    setSearchData((prev) => ({ ...prev, location }))
  }, [])

  const handleDateSelect = useCallback((checkIn: Date | null, checkOut: Date | null) => {
    setSearchData((prev) => ({ ...prev, checkIn, checkOut }))
  }, [])

  const handleGuestSelect = useCallback((guests: GuestCounts) => {
    setSearchData((prev) => ({ ...prev, guests }))
  }, [])

  const handleLogin = useCallback(() => {
    const userData = {
      id: "1",
      name: "Moni Roy",
      email: "jaskolski.brent@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    }
    login(userData)
    setShowLoginModal(false)
  }, [login])

  const handleSignup = useCallback(() => {
    const userData = {
      id: "1",
      name: "Moni Roy",
      email: "jaskolski.brent@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    }
    login(userData)
    setShowSignupModal(false)
  }, [login])

  if (variant === "compact") {
    return (
      <div className={`relative ${className}`} ref={searchRef}>
        <div className="flex items-center bg-white border border-gray-300 rounded-full shadow-sm px-6 py-3">
          <div className="text-sm">
            <span className="font-semibold">{searchData.location || "Anywhere"}</span>
            <span className="mx-2">·</span>
            <span>{formatDateRange()}</span>
            <span className="mx-2">·</span>
            <span>{formatGuests()}</span>
          </div>
          <Button
            size="sm"
            className="ml-4 rounded-full bg-blue-500 hover:bg-blue-600"
            onClick={() => setActiveModal("location")}
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {/* Modals for compact version */}
        <LocationSearchModal
          isOpen={activeModal === "location"}
          onClose={() => setActiveModal(null)}
          onSelect={(location) => {
            handleLocationSelect(location)
            setActiveModal("dates")
          }}
          selectedLocation={searchData.location}
        />
        <DatePickerModal
          isOpen={activeModal === "dates"}
          onClose={() => setActiveModal(null)}
          onSelect={(checkIn, checkOut) => {
            handleDateSelect(checkIn, checkOut)
            setActiveModal("guests")
          }}
          checkIn={searchData.checkIn}
          checkOut={searchData.checkOut}
        />
        <GuestSelectorModal
          isOpen={activeModal === "guests"}
          onClose={() => setActiveModal(null)}
          onSelect={(guests) => {
            handleGuestSelect(guests)
            handleSearch()
          }}
          guests={searchData.guests}
        />
      </div>
    )
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="flex items-center border border-gray-300 rounded-full shadow-sm hover:shadow-md transition-shadow bg-white">
        {/* Location */}
        <div className="relative">
          <button
            onClick={() => setActiveModal(activeModal === "location" ? null : "location")}
            className="px-6 py-3 text-left hover:bg-gray-50 rounded-l-full transition-colors"
          >
            <div className="text-xs font-semibold text-gray-800">Where</div>
            <div className="text-sm text-gray-600 w-32 truncate">{searchData.location || "Search destinations"}</div>
          </button>
          <LocationSearchModal
            isOpen={activeModal === "location"}
            onClose={() => setActiveModal(null)}
            onSelect={handleLocationSelect}
            selectedLocation={searchData.location}
          />
        </div>

        <Separator orientation="vertical" className="h-8" />

        {/* Check In */}
        <button
          onClick={() => setActiveModal(activeModal === "dates" ? null : "dates")}
          className="px-6 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="text-xs font-semibold text-gray-800">Check in</div>
          <div className="text-sm text-gray-600">
            {searchData.checkIn
              ? searchData.checkIn.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "Add dates"}
          </div>
        </button>

        <Separator orientation="vertical" className="h-8" />

        {/* Check Out */}
        <button
          onClick={() => setActiveModal(activeModal === "dates" ? null : "dates")}
          className="px-6 py-3 text-left hover:bg-gray-50 transition-colors"
        >
          <div className="text-xs font-semibold text-gray-800">Check out</div>
          <div className="text-sm text-gray-600">
            {searchData.checkOut
              ? searchData.checkOut.toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "Add dates"}
          </div>
        </button>

        <Separator orientation="vertical" className="h-8" />

        {/* Guests */}
        <div className="relative">
          <button
            onClick={() => setActiveModal(activeModal === "guests" ? null : "guests")}
            className="px-6 py-3 text-left hover:bg-gray-50 transition-colors"
          >
            <div className="text-xs font-semibold text-gray-800">Who</div>
            <div className="text-sm text-gray-600">{formatGuests()}</div>
          </button>
          <GuestSelectorModal
            isOpen={activeModal === "guests"}
            onClose={() => setActiveModal(null)}
            onSelect={handleGuestSelect}
            guests={searchData.guests}
          />
        </div>

        {/* Search Button */}
        <Button size="sm" className="rounded-full bg-blue-500 hover:bg-blue-600 mr-2 ml-2" onClick={handleSearch}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {/* Date Picker Modal */}
      <DatePickerModal
        isOpen={activeModal === "dates"}
        onClose={() => setActiveModal(null)}
        onSelect={handleDateSelect}
        checkIn={searchData.checkIn}
        checkOut={searchData.checkOut}
      />

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
    </div>
  )
}
