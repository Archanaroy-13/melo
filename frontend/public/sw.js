const CACHE_NAME = 'melo-static-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// Install event: Pre-cache static application shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network-first for API requests, Cache-first for static assets
// STRICT RULE: External audio stream URLs MUST NOT BE CACHED!
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass service worker caching for external audio streams or API calls
  if (
    url.pathname.startsWith('/api') ||
    url.hostname.includes('saavn') ||
    url.hostname.includes('jiosaavn') ||
    url.hostname.includes('lrclib') ||
    event.request.headers.get('range') ||
    event.request.destination === 'audio'
  ) {
    return; // Pass through to network directly without caching
  }

  // Cache static application assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
