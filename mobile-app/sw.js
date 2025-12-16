const CACHE_NAME = 'lotriflow-quit-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/app.js',
  '/src/payments.js',
  '/src/state.js',
  '/src/milestones.js',
  '/src/timer.js',
  '/src/notifications.js',
  '/src/ui.js',
  '/src/styles.css',
  '/manifest.json',
  '/assets/icon-192x192.png',
  '/assets/icon-512x512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
