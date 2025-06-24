"use client"

import { useState } from "react"
import { Globe, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function HostHeader() {
  const [userType, setUserType] = useState<"traveller" | "host">("host")
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()

  const handleUserTypeToggle = () => {
    setUserType("traveller")
    router.push("/")
  }

  const isActive = (path: string) => pathname === path

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/host" className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-800 font-serif">Sky-high</h1>
            <p className="text-xs text-gray-500 ml-2 mt-1">YOUR HOLIDAY</p>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/host"
              className={`font-medium pb-1 ${
                isActive("/host") ? "text-gray-900 border-b-2 border-gray-900" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Messages
            </Link>
            <Link
              href="/host/properties"
              className={`font-medium pb-1 ${
                isActive("/host/properties")
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Your properties
            </Link>
            <Link
              href="/host/incomes"
              className={`font-medium pb-1 ${
                isActive("/host/incomes")
                  ? "text-gray-900 border-b-2 border-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Incomes
            </Link>
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-sm font-medium" onClick={handleUserTypeToggle}>
              Switch to travelling
            </Button>
            <Button variant="ghost" size="sm">
              <Globe className="h-5 w-5" />
            </Button>
            {isLoggedIn ? (
              <div className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border border-gray-300 rounded-full p-2 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
