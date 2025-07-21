"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Settings } from "lucide-react"
import type { Booking } from "@/types/host"

export default function BookingManager() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with actual API call
    const mockBookings: Booking[] = [
      {
        id: "1",
        guest: {
          id: "1",
          name: "Balaji Nant",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        property: {
          id: "1",
          name: "Vancouver Property",
          location: "Vancouver",
        },
        checkIn: "11/02/2026",
        checkOut: "13/02/2026",
        totalCharges: 50000000,
        status: "confirmed",
        createdAt: "2025-01-15",
      },
      {
        id: "2",
        guest: {
          id: "2",
          name: "Nithya Menon",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        property: {
          id: "2",
          name: "Bangalore Property",
          location: "Bangalore",
        },
        checkIn: "13/04/2026",
        checkOut: "16/04/2026",
        totalCharges: 2000000,
        status: "confirmed",
        createdAt: "2025-01-14",
      },
      {
        id: "3",
        guest: {
          id: "3",
          name: "Meera Gonzalez",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        property: {
          id: "3",
          name: "Toronto Property",
          location: "Toronto",
        },
        checkIn: "11/11/2025",
        checkOut: "17/11/2025",
        totalCharges: 3000000,
        status: "confirmed",
        createdAt: "2025-01-13",
      },
      {
        id: "4",
        guest: {
          id: "4",
          name: "Karthik Subramanian",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        property: {
          id: "4",
          name: "Coimbatore Property",
          location: "Coimbatore",
        },
        checkIn: "15/12/2025",
        checkOut: "20/12/2025",
        totalCharges: 2000000,
        status: "confirmed",
        createdAt: "2025-01-12",
      },
    ]

    setTimeout(() => {
      setBookings(mockBookings)
      setLoading(false)
    }, 1000)
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(amount)
      .replace("₫", "đ")
  }

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.property.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold text-gray-900 mb-8">Booking manager</h1>

      {/* Search and Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">1 - 10 of 52</span>
          <div className="flex items-center space-x-1">
            {[...Array(6)].map((_, i) => (
              <Button key={i} variant="ghost" size="icon" className="w-8 h-8">
                <Settings className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <Card className="border border-gray-200 rounded-2xl">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Guest</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Properties</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Check in</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Check out</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Total charges</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-gray-100 last:border-b-0">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={booking.guest.avatar || "/placeholder.svg"} alt={booking.guest.name} />
                          <AvatarFallback>
                            {booking.guest.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-900">{booking.guest.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{booking.property.location}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{booking.checkIn}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-900">{booking.checkOut}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{formatCurrency(booking.totalCharges)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
