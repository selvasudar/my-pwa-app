// sw.js
const cacheName = 'my-pwa-app-cache';
const filesToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js'
];

const cacheDurationInMinutes = 60; // Cache duration in minutes

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== cacheName) {
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});

// Check for cache expiration and update cache
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.open(cacheName).then((cache) => {
            return cache.match(e.request).then((response) => {
                const fetchPromise = fetch(e.request).then((networkResponse) => {
                    cache.put(e.request, networkResponse.clone());
                    return networkResponse;
                });

                // Check if cache is older than cacheDurationInMinutes
                const cacheDate = response ? new Date(response.headers.get('date')) : null;
                if (cacheDate && (Date.now() - cacheDate.getTime()) > (cacheDurationInMinutes * 60 * 1000)) {
                    return fetchPromise;
                } else {
                    return response || fetchPromise;
                }
            });
        })
    );
});
