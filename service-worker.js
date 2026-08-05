/**
 * SELFCARE DIAGNOSTICS - Core Service Worker
 * File: service-worker.js
 * Production Mode: TRUE
 */

const CACHE_NAME = 'sc-static-v1';
const DYNAMIC_CACHE = 'sc-dynamic-v1';

// Static assets to pre-cache on installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/verify.html',
  '/assets/js/config.js',
  '/assets/js/api.js',
  '/assets/js/auth.js',
  '/assets/js/cart.js',
  '/assets/js/pwa.js'
];

/**
 * Service Worker Installation
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static core assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some static assets failed to cache during install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

/**
 * Service Worker Activation & Cache Cleanup
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
            console.log('[SW] Removing old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/**
 * Network Fetch Interceptor
 */
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Exclude Google Apps Script Web App API endpoints from caching
  if (requestUrl.hostname.includes('script.google.com') || requestUrl.hostname.includes('google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Handle standard HTTP/HTTPS requests with Stale-While-Revalidate strategy
  if (event.request.method === 'GET' && requestUrl.protocol.startsWith('http')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((err) => {
          console.log('[SW] Fetch failed; returning cached resource if available.', err);
        });

        return cachedResponse || fetchPromise;
      })
    );
  }
});

/**
 * Listen for update commands from pwa.js
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
