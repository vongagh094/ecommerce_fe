// public/sw.js
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push Received');
  
  const payload = event.data?.json() || {};
  
  event.waitUntil(
    self.registration.showNotification(
      payload.title || 'Thông báo mới',
      {
        body: payload.body,
        icon: payload.icon || '/vietnam-hero.png',
        data: { url: payload.url || '/' }
      }
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});