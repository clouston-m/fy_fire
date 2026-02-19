// fy_fire Service Worker
// Strategy: Cache-first for static assets, network-first for pages

const CACHE_NAME = 'fy_fire-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// Install: pre-cache shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for navigation, cache-first for static assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    // Network-first for page navigations
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
  } else {
    // Cache-first for static assets (JS, CSS, images)
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});
