/**
 * Service Worker pro Gastrotechno Group - Hlášení závad
 * Umožňuje offline funkčnost a rychlejší načítání
 */

const CACHE_NAME = 'gtg-zavady-v2';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon.svg',
    './logo.svg',
    './logo-white.svg'
];

// Instalace Service Workeru - vynutit okamžitou aktivaci
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Otevírám cache v2');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting();
            })
    );
});

// Aktivace Service Workeru - vymazat staré cache
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((cacheName) => cacheName !== CACHE_NAME)
                    .map((cacheName) => {
                        console.log('Mažu starou cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Zachycení fetch požadavků - network first strategie
self.addEventListener('fetch', (event) => {
    // Ignorovat non-GET požadavky
    if (event.request.method !== 'GET') return;
    
    // Ignorovat požadavky na externí zdroje (kromě fontů)
    const url = new URL(event.request.url);
    if (url.origin !== location.origin && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
        return;
    }

    // Network first - zkusit síť, pak cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache novou odpověď
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => cache.put(event.request, responseClone));
                }
                return response;
            })
            .catch(() => {
                // Offline - použít cache
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        // Offline fallback pro navigaci
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});
