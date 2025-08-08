'use client';

import { Calendar, MessageCircle, CheckCircle, Trash2, Bell, BellOff, Send, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import usePushNotification from '@/hooks/use-push-notification';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function NotificationsPage() {
  const router = useRouter();
  const {
    getNotifications,
    markAsRead,
    deleteNotification,
    subscribeToPush,
    unsubscribeFromPush,
    notifications,
    page,
    totalPages,
    setPage,
    isSubscribed,
    error,
  } = usePushNotification();
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        console.log('Fetching initial notifications for page 1');
        await getNotifications(1, true);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      console.log('Marking notification as read:', notificationId);
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    try {
      console.log('Deleting notification:', notificationId);
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handlePageChange = async (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setLoading(true);
      try {
        console.log('Fetching notifications for page:', newPage);
        await getNotifications(newPage, true);
        setPage(newPage);
      } catch (error) {
        console.error('Error fetching page:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleSubscription = async () => {
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
      } else {
        await subscribeToPush(1);
      }
    } catch (error) {
      console.error('Failed to toggle subscription:', error);
    }
  };

  const handleSendTestNotification = async () => {
    try {
      await axios.post(`http://127.0.0.1:8000/notifications/create`, {
        user_id: 1,
        title: 'Test Notification',
        message: 'This is a test notification sent from the frontend!',
        is_pushed: true,
        link: '/dashboard/notifications',
        type: 'test',
      });
      console.log('Test notification sent');
      await getNotifications(page, true);
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'booking':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-600 mt-1">
            Quản lý và theo dõi tất cả thông báo của bạn
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={handleToggleSubscription}
            variant={isSubscribed ? "destructive" : "default"}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            {isSubscribed ? (
              <>
                <BellOff className="h-4 w-4" />
                Tắt thông báo
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Bật thông báo
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSendTestNotification}
            variant="outline"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Send className="h-4 w-4" />
            Gửi thử
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-200">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Inbox className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có thông báo nào
              </h3>
              <p className="text-gray-600 text-center max-w-sm">
                Bạn chưa có thông báo nào. Khi có thông báo mới, chúng sẽ xuất hiện ở đây.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`transition-all duration-200 hover:shadow-md ${
                notification.is_read 
                  ? 'bg-white border-gray-200' 
                  : `${getNotificationColor(notification.type)} border-l-4`
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    notification.is_read ? 'bg-gray-100' : 'bg-white'
                  }`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-semibold ${
                            notification.is_read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                              Mới
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`text-sm mb-2 ${
                          notification.is_read ? 'text-gray-500' : 'text-gray-700'
                        }`}>
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleString('vi-VN')}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Button
                            onClick={() => handleMarkAsRead(notification.id)}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => handleDeleteNotification(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        {notification.data?.url && (
                          <Button
                            size="sm"
                            onClick={() => router.push(notification.data?.url ?? '/dashboard/notifications')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs"
                          >
                            {notification.data?.actionText || 'Xem'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                variant="outline"
                className="w-full sm:w-auto"
              >
                ← Trang trước
              </Button>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Trang</span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        className="w-8 h-8 p-0"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <span className="text-sm text-gray-600">/ {totalPages}</span>
              </div>
              
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                variant="outline"
                className="w-full sm:w-auto"
              >
                Trang sau →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
