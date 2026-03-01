const CACHE_NAME = 'ramadan-v2.1'; // IMPORTANT: Change this number (e.g., v3, v4) every time you update your HTML!
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Install Event: Cache assets and force new SW to take over
self.addEventListener('install', (e) => {
  self.skipWaiting(); 
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Activate Event: Clear old caches so users get the fresh update
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Network-first approach
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((networkResponse) => {
        // If network request succeeds, update the cache and return the fresh response
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // If offline or network fails, fallback to the cache
        return caches.match(e.request);
      })
  );
});

