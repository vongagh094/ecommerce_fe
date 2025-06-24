"use client"

import { Calendar, MessageCircle } from "lucide-react"
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
  },
  {
    id: 2,
    type: "message",
    icon: MessageCircle,
    message:
      "Ana, host of Adaaran Club Rannalhi, Maldives, Water Bungalows, Maldives has sent you a message, click here to see and reply to them!",
    hasAction: false,
    isUnread: true,
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
  },
  {
    id: 4,
    type: "message",
    icon: MessageCircle,
    message:
      "Ana, host of Adaaran Club Rannalhi, Maldives, Water Bungalows, Maldives has sent you a message, click here to see and reply to them!",
    hasAction: false,
    isUnread: true,
  },
]

export default function NotificationsPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
      </div>

      <div className="space-y-6">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <notification.icon className="h-5 w-5 text-gray-600" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm leading-relaxed">{notification.message}</p>
              </div>

              <div className="flex items-center space-x-3">
                {notification.isUnread && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                {notification.hasAction && (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    onClick={() => router.push("/dashboard/payment")}
                  >
                    {notification.actionText}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
