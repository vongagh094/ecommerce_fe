"use client"

import { useState, useRef, useEffect } from "react"
import { Bell, Calendar, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const notifications = [
  {
    id: 1,
    type: "booking",
    icon: Calendar,
    message:
      "You have bid successfully for 2 nights in Adaaran Club Rannalhi, Maldives, Water Bungalows, please click onto this notification to pay your check!",
    hasAction: true,
    actionText: "Pay now!",
    isUnread: true,
    time: "2 hours ago",
  },
  {
    id: 2,
    type: "message",
    icon: MessageCircle,
    message:
      "Ana, host of Adaaran Club Rannalhi, Maldives, Water Bungalows, Maldives has sent you a message, click here to see and reply to them!",
    hasAction: false,
    isUnread: true,
    time: "4 hours ago",
  },
  {
    id: 3,
    type: "booking",
    icon: Calendar,
    message:
      "You have bid successfully for 2 nights in Adaaran Club Rannalhi, Maldives, Water Bungalows, Maldives, please click onto this notification to pay your check!",
    hasAction: true,
    actionText: "Pay now!",
    isUnread: true,
    time: "1 day ago",
  },
  {
    id: 4,
    type: "message",
    icon: MessageCircle,
    message:
      "Ana, host of Adaaran Club Rannalhi, Maldives, Water Bungalows, Maldives has sent you a message, click here to see and reply to them!",
    hasAction: false,
    isUnread: false,
    time: "2 days ago",
  },
]

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const unreadCount = notifications.filter((n) => n.isUnread).length

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleNotificationClick = (notification: (typeof notifications)[0]) => {
    if (notification.hasAction) {
      router.push("/dashboard/payment")
    } else {
      router.push("/dashboard/messages")
    }
    setIsOpen(false)
  }

  const handleViewAll = () => {
    router.push("/dashboard/notifications")
    setIsOpen(false)
  }

  const truncateMessage = (message: string, maxLength = 80) => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message
  }

  // Only show notifications if user might be logged in (simplified check)
  const showNotifications = true // We'll show for all users in search page

  if (!showNotifications) {
    return null
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 4).map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                      <notification.icon className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 leading-relaxed mb-1">
                      {truncateMessage(notification.message)}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{notification.time}</span>
                      {notification.hasAction && (
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1 h-auto">
                          {notification.actionText}
                        </Button>
                      )}
                    </div>
                  </div>

                  {notification.isUnread && <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-2"></div>}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleViewAll}
              variant="ghost"
              className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            >
              View all notifications
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
