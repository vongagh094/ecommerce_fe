"use client"

import { Button } from "@/components/ui/button"
import { UserMenu } from "@/components/shared/user-menu"
import { NotificationDropdown } from "@/components/shared/notification-dropdown"
import { SearchBar } from "@/components/shared/search-bar"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export function AppHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const { isLoggedIn } = useAuth()

  const handleHostToggle = () => {
    if (pathname.startsWith("/host")) {
      router.push("/")
    } else {
      router.push("/host")
    }
  }

  const isHostPage = pathname.startsWith("/host")
  const isSearchPage = pathname.startsWith("/search")
  const isPropertyPage = pathname.startsWith("/property")

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <h1 className="text-2xl font-bold text-rose-500">Sky-high</h1>
            {!isHostPage && <p className="text-xs text-gray-500 ml-2 mt-1">YOUR HOLIDAY</p>}
          </Link>

          {/* Search Bar - Show on all pages except host pages */}
          {!isHostPage && (
            <div className="hidden md:flex">
              <SearchBar variant={isSearchPage ? "compact" : "default"} />
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-sm font-semibold" onClick={handleHostToggle}>
              {isHostPage ? "Switch to travelling" : "Become a host"}
            </Button>
            {isLoggedIn && <NotificationDropdown />}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  )
}
