import { useState, useEffect } from 'react';
import axios from 'axios';
import { VAPID_PUBLIC_KEY } from '../lib/vapid'; 
import { useAuth } from '@/contexts/auth-context';
interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  is_pushed: boolean;
  created_at: string;
  data?: { url?: string; actionText?: string };
}

interface NotificationResponse {
  notifications: Notification[];
  metadata: {
    page: number;
    limit: number;
    total_notifications: number;
    total_pages: number;
  };
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL;
const user = useAuth().user;
const userId = Number(user?.id || 1);

interface UsePushNotification {
  notifications: Notification[];
  page: number;
  totalPages: number;
  isSubscribed: boolean;
  error: string | null;
  setPage: (page: number) => void;
  getNotifications: (page: number, refresh?: boolean) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  subscribeToPush: (userId: number) => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
}

const urlBase64ToUint8Array = (base64String: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
};

const usePushNotification = (): UsePushNotification => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra trạng thái subscription
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.pushManager.getSubscription().then((subscription) => {
          setIsSubscribed(!!subscription);
        });
      });
    }
  }, []);

  // Lấy danh sách thông báo
  const getNotifications = async (newPage: number, refresh: boolean = false): Promise<void> => {
    try {
      setError(null);
      const response = await axios.get<NotificationResponse>(
        `${apiUrl}/notifications/list?user_id=${userId}&page=${newPage}&limit=5`
      );
      setNotifications(response.data.notifications);
      setTotalPages(response.data.metadata.total_pages);
      if (refresh) {
        setPage(newPage);
      }
    } catch (err) {
      setError('Không thể lấy thông báo');
      console.error('Lỗi lấy thông báo:', err);
    }
  };

  // Đánh dấu thông báo đã đọc
  const markAsRead = async (notificationId: number): Promise<void> => {
    try {
      await axios.put(`${apiUrl}/notifications/read?notification_id=${notificationId}`);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      setError('Không thể đánh dấu đã đọc');
      console.error('Lỗi đánh dấu đã đọc:', err);
    }
  };

  // Xóa thông báo
  const deleteNotification = async (notificationId: number): Promise<void> => {
    try {
      await axios.delete(`${apiUrl}/notifications/delete?notification_id=${notificationId}`);
      setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId));
    } catch (err) {
      setError('Không thể xóa thông báo');
      console.error('Lỗi xóa thông báo:', err);
    }
  };

  // Đăng ký push notification
  const subscribeToPush = async (userId: number): Promise<void> => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications không được hỗ trợ');
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });


      await axios.post(`${apiUrl}/notifications/subscribe`, {
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.getKey('p256dh')
          ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!)))
          : null,
        auth: subscription.getKey('auth')
          ? btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
          : null,
      });

      setIsSubscribed(true);
    } catch (err) {
      setError('Không thể đăng ký push notification');
      console.error('Lỗi đăng ký push:', err);
    }
  };

  // Hủy đăng ký push notification
  const unsubscribeFromPush = async (): Promise<void> => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await axios.delete(`${apiUrl}/notifications/unsubscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`);
        setIsSubscribed(false);
      }
    } catch (err) {
      setError('Không thể hủy đăng ký push notification');
      console.error('Lỗi hủy đăng ký push:', err);
    }
  };

  return {
    notifications,
    page,
    totalPages,
    isSubscribed,
    error,
    setPage,
    getNotifications,
    markAsRead,
    deleteNotification,
    subscribeToPush,
    unsubscribeFromPush,
  };
};

export default usePushNotification;