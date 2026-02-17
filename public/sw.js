// Custom service worker for push notifications
// This runs alongside vite-plugin-pwa's generated service worker

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New booking received!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    image: data.image || undefined,
    tag: data.tag || 'booking-notification',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200, 100, 200],
    data: data.url || '/',
    actions: data.actions || [
      { action: 'view', title: '👁️ View Details' },
      { action: 'confirm', title: '✅ Confirm' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '🚕 New Booking!', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const urlToOpen = event.notification.data || '/admin/morocco-cmd';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
