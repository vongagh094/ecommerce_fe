import type React from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer caret-transparent select-none" onClick={() => router.push("/")}>
              <h1 className="text-xl font-bold text-blue-800 font-serif">Sky-high Admin</h1>
            </div>
            <nav className="flex space-x-8">
              <a href="/admin" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </a>
              <a href="/admin/users" className="text-gray-600 hover:text-gray-900">
                Users
              </a>
              <a href="/admin/properties" className="text-gray-600 hover:text-gray-900">
                Properties
              </a>
              <a href="/admin/bookings" className="text-gray-600 hover:text-gray-900">
                Bookings
              </a>
            </nav>
          </div>
        </div>
      </header>
      {children}
    </div>
  )
}
