/**
 * Service Worker pro Gastrotechno Group - Hlášení závad
 * Umožňuje offline funkčnost a rychlejší načítání
 */

const CACHE_NAME = 'gtg-zavady-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json',
    '/icon.svg'
];

// Instalace Service Workeru
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Otevírám cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Aktivace Service Workeru
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => caches.delete(cacheName))
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Zachycení fetch požadavků
self.addEventListener('fetch', (event) => {
    // Ignorovat non-GET požadavky
    if (event.request.method !== 'GET') return;
    
    // Ignorovat požadavky na externí zdroje (kromě fontů)
    const url = new URL(event.request.url);
    if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Vrátit cache pokud existuje
                if (cachedResponse) {
                    // Aktualizovat cache na pozadí
                    event.waitUntil(
                        fetch(event.request)
                            .then((response) => {
                                if (response.ok) {
                                    caches.open(CACHE_NAME)
                                        .then((cache) => cache.put(event.request, response));
                                }
                            })
                            .catch(() => {})
                    );
                    return cachedResponse;
                }

                // Jinak stáhnout ze sítě
                return fetch(event.request)
                    .then((response) => {
                        // Cache nové zdroje
                        if (response.ok) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => cache.put(event.request, responseClone));
                        }
                        return response;
                    })
                    .catch(() => {
                        // Offline fallback pro navigaci
                        if (event.request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                    });
            })
    );
});

