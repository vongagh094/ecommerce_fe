"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Users, DollarSign, Clock, Search, RefreshCw, MessageCircle, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import type { BookingResponse } from "@/types/booking"

export default function BookingManager() {
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingResponse[]>([])
  const [filteredBookings, setFilteredBookings] = useState<BookingResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingBookings, setDeletingBookings] = useState<Set<string>>(new Set())

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState("all")

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = "http://127.0.0.1:8000"
      const hostId = 1 // Using integer instead of UUID
      const response = await fetch(`${apiUrl}/bookings/host/${hostId}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || `Failed to fetch bookings: ${response.statusText}`)
      }
      const data: BookingResponse[] = await response.json()
      setBookings(data)
    } catch (err: any) {
      setError(err.message || "Failed to load bookings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  useEffect(() => {
    let filtered = bookings

    // Search by guest ID or booking ID
    if (searchTerm) {
      filtered = filtered.filter(
        (booking) =>
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.guest_id.toString().includes(searchTerm),
      )
    }

    // Filter by booking status
    if (statusFilter !== "all") {
      filtered = filtered.filter((booking) => booking.booking_status === statusFilter)
    }

    // Filter by payment status
    if (paymentFilter !== "all") {
      filtered = filtered.filter((booking) => booking.payment_status === paymentFilter)
    }

    // Filter by date
    if (dateFilter !== "all") {
      const now = new Date()
      filtered = filtered.filter((booking) => {
        const checkIn = new Date(booking.check_in_date)
        const checkOut = new Date(booking.check_out_date)

        switch (dateFilter) {
          case "upcoming":
            return checkIn > now
          case "current":
            return checkIn <= now && checkOut >= now
          case "past":
            return checkOut < now
          default:
            return true
        }
      })
    }

    setFilteredBookings(filtered)
  }, [bookings, searchTerm, statusFilter, paymentFilter, dateFilter])

  const handleContactGuest = async (booking: BookingResponse) => {
    try {
      const apiUrl = "http://127.0.0.1:8000"
      const response = await fetch(`${apiUrl}/conversations/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          host_id: booking.host_id,
          guest_id: booking.guest_id,
          property_id: booking.property_id,
        }),
      })

      if (response.ok) {
        const { id: conversationId } = await response.json()
        router.push(`/host/messages?conversationId=${conversationId}&hostId=${booking.host_id}`)
      } else {
        const error = await response.json()
        console.error("Lỗi khi tạo conversation:", error)
      }
    } catch (error) {
      console.error("Lỗi khi tạo conversation:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount)
  }

  const getBookingStatusBadge = (status: string) => {
    const variants = {
      CONFIRMED: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      CANCELLED: "bg-red-100 text-red-800 border-red-200",
      COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getPaymentStatusBadge = (status: string) => {
    const variants = {
      PAID: "bg-green-100 text-green-800 border-green-200",
      PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
      FAILED: "bg-red-100 text-red-800 border-red-200",
      REFUNDED: "bg-gray-100 text-gray-800 border-gray-200",
    }
    return variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const handleDeleteBooking = async (bookingId: string) => {
    setDeletingBookings((prev) => new Set(prev).add(bookingId))

    try {
      const apiUrl = "http://127.0.0.1:8000"
      const response = await fetch(`${apiUrl}/bookings/delete/${bookingId}`, {
        method: "DELETE",
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || "Failed to delete booking")
      }
      fetchBookings()
    } catch (err: any) {
      setError(err.message || "Failed to delete booking")
    } finally {
      setDeletingBookings((prev) => {
        const newSet = new Set(prev)
        newSet.delete(bookingId)
        return newSet
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="bg-gray-50 rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Quản lý tất cả booking</h1>
              <p className="text-sm text-gray-600">
                {filteredBookings.length > 0 ? `${filteredBookings.length} booking` : "Chưa có booking nào"}
              </p>
            </div>
          </div>
          <Button onClick={fetchBookings} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Tìm theo ID booking hoặc guest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái booking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái thanh toán" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thanh toán</SelectItem>
              <SelectItem value="PAID">Đã thanh toán</SelectItem>
              <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
              <SelectItem value="FAILED">Thất bại</SelectItem>
              <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Thời gian" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả thời gian</SelectItem>
              <SelectItem value="upcoming">Sắp tới</SelectItem>
              <SelectItem value="current">Hiện tại</SelectItem>
              <SelectItem value="past">Đã qua</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("")
              setStatusFilter("all")
              setPaymentFilter("all")
              setDateFilter("all")
            }}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="animate-pulse space-y-4">
                <div className="flex gap-3">
                  <div className="h-6 w-20 bg-gray-200 rounded-full"></div>
                  <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-3 w-32 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                    <div className="h-3 w-28 bg-gray-200 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-white rounded-lg border p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Có lỗi xảy ra</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Button onClick={fetchBookings} variant="default">
            Thử lại
          </Button>
        </div>
      )}

      {!loading && !error && filteredBookings.length === 0 && (
        <div className="bg-white rounded-lg border p-12 text-center">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
            <Calendar className="h-10 w-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">
            {searchTerm ? "Không tìm thấy booking nào" : "Chưa có booking nào"}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            {searchTerm
              ? "Thử thay đổi từ khóa tìm kiếm hoặc xóa bộ lọc để xem tất cả booking."
              : "Host này chưa có booking nào. Khi có khách đặt phòng, thông tin sẽ hiển thị tại đây."}
          </p>
          {searchTerm && (
            <Button onClick={() => setSearchTerm("")} variant="outline">
              Xóa bộ lọc
            </Button>
          )}
        </div>
      )}

      {!loading && !error && filteredBookings.length > 0 && (
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className={`bg-white rounded-lg border hover:shadow-md transition-all duration-200 relative ${
                deletingBookings.has(booking.id) ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              {deletingBookings.has(booking.id) && (
                <div className="absolute inset-0 bg-white/80 rounded-lg flex items-center justify-center z-10">
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg shadow-lg border">
                    <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                    <span className="text-sm font-medium text-gray-700">Đang xóa booking...</span>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge className={`${getBookingStatusBadge(booking.booking_status)} border font-medium`}>
                      {booking.booking_status}
                    </Badge>
                    <Badge className={`${getPaymentStatusBadge(booking.payment_status)} border font-medium`}>
                      {booking.payment_status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleContactGuest(booking)}
                      className="hover:bg-blue-50 hover:text-blue-600"
                      title="Nhắn tin với khách"
                      disabled={deletingBookings.has(booking.id)}
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBooking(booking.id)}
                      className={`hover:bg-red-50 hover:text-red-600 ${
                        deletingBookings.has(booking.id) ? "bg-red-50 text-red-600" : ""
                      }`}
                      disabled={deletingBookings.has(booking.id)}
                    >
                      {deletingBookings.has(booking.id) ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Calendar className="h-4 w-4" />
                      <span>Thời gian lưu trú</span>
                    </div>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nhận phòng:</span>
                        <span className="font-medium">{formatDate(booking.check_in_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trả phòng:</span>
                        <span className="font-medium">{formatDate(booking.check_out_date)}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t border-gray-100">
                        <span className="text-gray-600">Tổng số đêm:</span>
                        <span className="font-semibold text-gray-900">{booking.total_nights} đêm</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Users className="h-4 w-4" />
                      <span>Thông tin booking</span>
                    </div>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Guest ID:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{booking.guest_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Host ID:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{booking.host_id}</span>
                      </div>
                      {booking.auction_id && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Auction ID:</span>
                          <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{booking.auction_id}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">Property ID:</span>
                        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{booking.property_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bất động sản:</span>
                        <span className="font-medium text-blue-600">Property #{booking.property_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <DollarSign className="h-4 w-4" />
                      <span>Chi phí & thanh toán</span>
                    </div>
                    <div className="space-y-2 pl-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Giá cơ bản:</span>
                        <span className="font-medium">{formatCurrency(booking.base_amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Phí dọn dẹp:</span>
                        <span className="font-medium">{formatCurrency(booking.cleaning_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Thuế:</span>
                        <span className="font-medium">{formatCurrency(booking.taxes)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-100">
                        <span className="text-gray-900 font-medium">Tổng cộng:</span>
                        <span className="font-semibold text-lg text-gray-900">
                          {formatCurrency(booking.total_amount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Tạo: {formatDate(booking.created_at)}</span>
                  </div>
                  <div>Cập nhật: {formatDate(booking.updated_at)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
