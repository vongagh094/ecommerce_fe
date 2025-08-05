"use client"

import { Shield } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useState, useCallback } from "react"
import { LoginModal } from "@/components/auth/login-modal"
import { SignupModal } from "@/components/auth/signup-modal"

interface HostProfileProps {
  hostId: number
  propertyId: number
}

const apiUrl = "http://127.0.0.1:8000"

export function HostProfile({ hostId = 3, propertyId = 1 }: HostProfileProps) {
  const router = useRouter()
  const { isLoggedIn, user, login } = useAuth()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)
  const [pendingContact, setPendingContact] = useState(false)

  const handleContactHost = useCallback(async () => {
    if (!isLoggedIn) {
      setPendingContact(true)
      setShowLoginModal(true)
      return
    }

    const guestId = user?.id ? parseInt(user.id) : null
    if (!guestId) {
      console.error("Không tìm thấy guestId từ user")
      return
    }

    try {
      const response = await fetch(`${apiUrl}/conversations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ host_id: hostId, guest_id: guestId, property_id: propertyId }),
      })

      if (response.ok) {
        const { id: conversationId } = await response.json()
        console.log("Conversation created:", { conversationId })
        router.push(`/dashboard/messages?conversationId=${conversationId}`)
      } else {
        const error = await response.json()
        console.error("Lỗi khi tạo conversation:", error)
      }
    } catch (error) {
      console.error("Lỗi khi tạo conversation:", error)
    }
  }, [isLoggedIn, user, hostId, propertyId, router])

  const handleLogin = useCallback(() => {
    const userData = {
      id: "1",
      name: "Moni Roy",
      email: "jaskolski.brent@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    }
    login(userData)
    setShowLoginModal(false)
    if (pendingContact) {
      handleContactHost()
      setPendingContact(false)
    } else {
      router.push("/dashboard/messages")
    }
  }, [login, pendingContact, handleContactHost, router])

  const handleSignup = useCallback(() => {
    const userData = {
      id: "1",
      name: "Moni Roy",
      email: "jaskolski.brent@gmail.com",
      avatar: "/placeholder.svg?height=40&width=40",
    }
    login(userData)
    setShowSignupModal(false)
    if (pendingContact) {
      handleContactHost()
      setPendingContact(false)
    } else {
      router.push("/dashboard/messages")
    }
  }, [login, pendingContact, handleContactHost, router])

  return (
    <>
      <div className="border-t pt-8">
        <div className="flex items-start space-x-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Ghazal" />
            <AvatarFallback>G</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Hosted by Ghazal</h2>
            <p className="text-gray-600 text-sm mb-4">Joined in November 2021</p>

            <div className="flex items-center space-x-4 mb-6">
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium">12 reviews</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-sm">Identity verified</span>
              </div>
              <div className="flex items-center space-x-1">
                <span className="text-sm">Superhost</span>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-700">
                <strong>Ghazal is a Superhost</strong>
              </p>
              <p className="text-sm text-gray-700">
                Superhosts are experienced, highly rated hosts who are committed to providing great stays for guests.
              </p>
              <p className="text-sm text-gray-700">
                <strong>Response rate: 100%</strong>
              </p>
              <p className="text-sm text-gray-700">
                <strong>Response time: within an hour</strong>
              </p>
            </div>

            <Button variant="outline" onClick={handleContactHost}>
              Contact Host
            </Button>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>
                  To protect your payment, never transfer money or communicate outside of the Sky-high website or app.
                </span>
              </div>
            </div>
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
    </>
  )
}