const CACHE_NAME = 'skypulse-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event (Offline Support)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});

// Handle Weather Notification Trigger
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_NOTIFICATION') {
    const { lat, lon, locationLabel } = event.data.payload;
    fetchAndSendWeatherNotification(lat, lon, locationLabel);
  }
});

async function fetchAndSendWeatherNotification(lat, lon, locationLabel) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=Europe/London`;
    const res = await fetch(url);
    const data = await res.json();

    const temp = Math.round(data.current.temperature_2m);
    
    self.registration.showNotification(`8:00 AM Weather Update for ${locationLabel}`, {
      body: `Current temperature is ${temp}°C. Have a great day!`,
      icon: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/1163/1163661.png'
    });
  } catch (err) {
    console.error('Notification error:', err);
  }
}
