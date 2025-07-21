import { useState, useEffect, useRef } from 'react';
import { VAPID_PUBLIC_KEY } from '@/lib/vapid';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const useNotificationManager = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const isInitialized = useRef(false);
  const [pendingNotifications, setPendingNotifications] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<any[]>([]); // Cache notifications
  const lastFetched = useRef<number | null>(null); // Track last fetch timestamp
  const FETCH_COOLDOWN = 60000; // 1 minute cooldown (adjust as needed)

  const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
  const userId = 1;

  const checkSubscription = async (reg: ServiceWorkerRegistration) => {
    try {
      const subscription = await reg.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      return subscription;
    } catch (err) {
      setError('Error checking subscription: ' + (err instanceof Error ? err.message : String(err)));
      return null;
    }
  };

  const subscribeUser = async (reg: ServiceWorkerRegistration) => {
    try {
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...subscription.toJSON(),
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }

      setIsSubscribed(true);
      setError(null);
      return true;
    } catch (err) {
      setError('Subscription failed: ' + (err instanceof Error ? err.message : String(err)));
      setIsSubscribed(false);
      return false;
    }
  };

  const unsubscribeUser = async () => {
    if (!registration) return false;

    try {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        setIsSubscribed(false);
        return true;
      }
      return false;
    } catch (err) {
      setError('Unsubscription failed: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  };

  const requestPermission = async () => {
    if (!registration) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        return await subscribeUser(registration);
      } else {
        setError('Permission denied');
        return false;
      }
    } catch (err) {
      setError('Permission request failed: ' + (err instanceof Error ? err.message : String(err)));
      return false;
    }
  };

  const saveNotification = async (
    title: string,
    message: string,
    userId: number,
    icon: string = '/images/notification.png',
    url: string = '/dashboard/notifications',
    type: string | null = null
  ) => {
    const notificationId = Date.now().toString();

    if (pendingNotifications.has(notificationId)) return;

    setPendingNotifications(prev => new Set(prev).add(notificationId));

    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          title,
          message,
          data: JSON.stringify({ icon, url }),
          is_pushed: false,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 100));
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save OC notification');
      }

      // Update cached notifications
      setNotifications(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Failed to save notification:', err);
      setError('Failed to save notification: ' + (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setPendingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`/api/notification?read=true&notification_id=${notificationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json().catch(() => {
        throw new Error('Invalid JSON response');
      });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark as read');
      }

      // Update cached notifications
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
      return data;
    } catch (err) {
      setError('Failed to mark as read: ' + (err instanceof Error ? err.message : String(err)));
      throw err;
    }
  };

  const sendAndSaveNotification = async (
    title: string,
    message: string,
    userId: number,
    icon: string = '/images/notification.png',
    url: string = '/dashboard/notifications',
    type: string | null = null
  ) => {
    const notificationId = Date.now().toString();

    if (pendingNotifications.has(notificationId)) return;

    setPendingNotifications(prev => new Set(prev).add(notificationId));

    try {
      const response = await fetch('/api/notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type,
          title,
          message,
          data: JSON.stringify({ icon, url }),
          is_pushed: true,
        }),
      });

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text.slice(0, 100));
        throw new Error(`Expected JSON but got ${contentType}`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send and save notification');
      }

      // Update cached notifications
      setNotifications(prev => [...prev, data]);
      return data;
    } catch (err) {
      setError('Failed to send and save notification: ' + (err instanceof Error ? err.message : String(err)));
      throw err;
    } finally {
      setPendingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const getNotifications = async (force: boolean = false) => {
    // Check if we recently fetched notifications
    if (!force && lastFetched.current && Date.now() - lastFetched.current < FETCH_COOLDOWN) {
      return notifications; // Return cached notifications
    }

    try {
      const response = await fetch('/api/notification', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data.notifications); // Cache notifications
      lastFetched.current = Date.now(); // Update last fetch time
      return data.notifications;
    } catch (err) {
      setError('Failed to fetch notifications: ' + (err instanceof Error ? err.message : String(err)));
      return notifications; // Return cached notifications on error
    }
  };

  const deleteNotification = async (id: number) => {
    try {
      const response = await fetch('/api/notification', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.status === 204) {
        // Update cached notifications
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        return true;
      }

      const errorData = await response.json();
      throw new Error(errorData.error || 'Delete failed');
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isInitialized.current || typeof window === 'undefined') return;
    isInitialized.current = true;

    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          setRegistration(reg);
          checkSubscription(reg);
        })
        .catch((err) => {
          setError('Service Worker registration failed: ' + (err instanceof Error ? err.message : String(err)));
        });
    } else {
      setError('Push notifications are not supported in this browser');
    }
  }, []);

  return {
    isSubscribed,
    error,
    requestPermission,
    unsubscribeUser,
    saveNotification,
    sendAndSaveNotification,
    getNotifications,
    markAsRead,
    deleteNotification,
    notifications, // Expose cached notifications
  };
};

export default useNotificationManager;