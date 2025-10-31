// Simple service worker: precache app shell and runtime cache GET requests
const CACHE_NAME = 'book-rental-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests
  if (request.method !== 'GET') return;

  // Runtime caching strategy: try network, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache responses that opt-in via the x-cache-allow header
        try {
          const allow = response.headers.get('x-cache-allow');
          if (allow) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
        } catch {
          // ignore
        }
        return response;
      })
      .catch(() => caches.match(request).then((r) => r))
  );
});
