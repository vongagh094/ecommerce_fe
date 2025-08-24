"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Home } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { logout, isAdmin } = useAuth()

  // Handle admin access check and redirect
  useEffect(() => {
    if (!isAdmin) {
      router.push("/")
    }
  }, [isAdmin, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  const handleHomeClick = () => {
    router.push("/")
  }

  // Don't render anything if not admin (will redirect)
  if (!isAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-6">
              <div className="flex items-center cursor-pointer caret-transparent select-none" onClick={handleHomeClick}>
                <h1 className="text-xl font-bold text-blue-800 font-serif">Sky-high Admin</h1>
              </div>
              <nav className="flex space-x-8">
                <a href="/admin" className="text-gray-600 hover:text-gray-900 font-medium">
                  Dashboard
                </a>
                <a href="/admin/users" className="text-gray-600 hover:text-gray-900 font-medium">
                  Users
                </a>
                <a href="/admin/properties" className="text-gray-600 hover:text-gray-900 font-medium">
                  Properties
                </a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleHomeClick}>
                <Home className="h-4 w-4 mr-2" />
                Back to Site
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
