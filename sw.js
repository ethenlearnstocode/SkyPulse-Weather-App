const CACHE_NAME = 'skypulse-v1';

// Install event - bypass waiting to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate event - claim all clients instantly
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Fetch event - handle basic offline fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Push / Message listener for weather notifications
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { lat, lon, locationLabel } = event.data.payload;
    
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
      );
      const data = await response.json();
      const temp = Math.round(data.current.temperature_2m);

      await self.registration.showNotification(`SkyPulse Alert: ${locationLabel}`, {
        body: `Current weather update: ${temp}°C.`,
        icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png'
      });
    } catch (err) {
      console.error('Notification error:', err);
    }
  }
});
