"use client"

import type React from "react"
import { useRouter, usePathname } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/shared/user-menu"
import { NotificationDropdown } from "@/components/shared/notification-dropdown"
import { useAuth } from "@/contexts/auth-context"
import { SecondChanceOfferModal } from "@/components/traveller/second-chance-offer-modal"
import { useSecondChanceOffers } from "@/hooks/use-second-chance-offers"

const navigationTabs = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "notifications", label: "Notification", path: "/dashboard/notifications" },
  { id: "wishlists", label: "Wishlists", path: "/dashboard/wishlists" },
  { id: "trips", label: "Your trips", path: "/dashboard/trips" },
  { id: "messages", label: "Messages", path: "/dashboard/messages" },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()

  const handleHostToggle = () => {
    router.push("/host")
  }

  const handleBackToHome = () => {
    router.push("/")
  }

  // Second chance offers
  const {
    currentOffer,
    property,
    isModalOpen,
    setIsModalOpen,
    acceptOffer,
    declineOffer,
  } = useSecondChanceOffers()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center cursor-pointer caret-transparent select-none" onClick={() => router.push("/")}>
              <h1 className="text-2xl font-bold text-blue-800 font-serif">Sky-high</h1>
              <p className="text-xs text-gray-500 ml-2 mt-1">YOUR HOLIDAY</p>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => router.push(tab.path)}
                  className={`font-medium pb-1 transition-colors ${
                    pathname === tab.path
                      ? "text-gray-900 border-b-2 border-gray-900"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="text-sm font-semibold" onClick={handleHostToggle}>
                Switch to hosting
              </Button>
              {isLoggedIn && <NotificationDropdown />}
              {isLoggedIn && <div className="w-8 h-8 bg-gray-400 rounded-full"></div>}
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={handleBackToHome}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 p-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        {children}
      </div>

      {/* Second Chance Offer Modal */}
      {isLoggedIn && currentOffer && property && (
        <SecondChanceOfferModal
          offer={currentOffer}
          property={property}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onAccept={acceptOffer}
          onDecline={() => declineOffer()}
        />
      )}
    </div>
  )
}
