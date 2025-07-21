"use client";

import { Calendar, MessageCircle, CheckCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import useNotificationManager from "@/hooks/use-push-notification";
import { useEffect, useState } from "react";

interface Notification {
  id: number;
  type: string | null;
  user_id: number | null;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  is_pushed: boolean;
  created: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const { getNotifications, markAsRead, deleteNotification } = useNotificationManager();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [getNotifications]);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Notifications</h1>
      </div>

      <div className="space-y-6">
        {notifications.length === 0 ? (
          <p>No notifications found.</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {notification.type === "booking" ? (
                      <Calendar className="h-5 w-5 text-gray-600" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 text-sm leading-relaxed">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.created).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  {notification.is_read === false && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="text-green-500 hover:text-green-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteNotification(notification.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  {notification.data?.url && (
                    <Button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                      onClick={() => router.push(notification.data.url)}
                    >
                      {notification.data.actionText || "View"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}