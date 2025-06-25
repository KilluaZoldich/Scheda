const CACHE_NAME = 'fittracker-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/icons/icon-192x192.png' // Added icon for notification
    // Add other important assets like icons if they are local files
];

self.addEventListener('install', (event) => {
    console.log('[SW] Install event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Opened cache:', CACHE_NAME);
                return cache.addAll(urlsToCache);
            })
            .catch(err => {
                console.error('[SW] Failed to cache urls:', err);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response; // Serve from cache
                }
                // Not in cache, fetch from network
                return fetch(event.request).then(
                    (networkResponse) => {
                        // Optionally, cache the new resource dynamically
                        // Be careful with what you cache, especially with POST requests or API calls
                        // if (event.request.method === 'GET' && urlsToCache.includes(event.request.url)) {
                        //     return caches.open(CACHE_NAME).then((cache) => {
                        //         cache.put(event.request, networkResponse.clone());
                        //         return networkResponse;
                        //     });
                        // }
                        return networkResponse;
                    }
                ).catch(err => {
                    console.error('[SW] Fetch failed:', err);
                    // Optionally, return a fallback page if offline and not cached
                    // if (event.request.mode === 'navigate') {
                    //     return caches.match('/offline.html'); // You'd need an offline.html cached
                    // }
                });
            })
    );
});

self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event');
    // Clean up old caches if necessary
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.filter((cacheName) => {
                    return cacheName.startsWith('fittracker-') && cacheName !== CACHE_NAME;
                }).map((cacheName) => {
                    return caches.delete(cacheName);
                })
            );
        })
    );
    return self.clients.claim(); // Ensure new SW takes control immediately
});

// Timer state in SW
let timerInterval = null;
let timerEndTime = 0;
let timerDuration = 0;

function updateClientsWithTimer(remaining) {
    self.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
        clients.forEach(client => {
            client.postMessage({ type: 'TIMER_UPDATE', remaining: remaining });
        });
    });
}

function handleTimerTick() {
    const now = Date.now();
    const remaining = Math.max(0, Math.round((timerEndTime - now) / 1000));

    updateClientsWithTimer(remaining);

    if (remaining === 0) {
        clearInterval(timerInterval);
        timerInterval = null;
        console.log('[SW] Timer finished in Service Worker.');
        // Optionally, show a notification from SW if clients are not active
        self.registration.showNotification('FitTracker Pro', {
            body: 'Timer completato!'
            // icon: '/icons/icon-192x192.png' // Rimosso temporaneamente perché il file non esiste nel progetto.
                                            // L'utente dovrebbe aggiungere le proprie icone e specificare il percorso.
        });
    }
}

self.addEventListener('message', (event) => {
    if (!event.data) return;

    console.log('[SW] Message received:', event.data);

    if (event.data.type === 'START_TIMER') {
        if (timerInterval) {
            clearInterval(timerInterval);
        }
        timerDuration = event.data.duration;
        timerEndTime = Date.now() + (timerDuration * 1000);
        console.log(`[SW] Starting timer. Duration: ${timerDuration}s, EndTime: ${new Date(timerEndTime).toLocaleTimeString()}`);

        // Initial update to clients
        updateClientsWithTimer(timerDuration);

        timerInterval = setInterval(handleTimerTick, 1000);
    } else if (event.data.type === 'STOP_TIMER') {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            console.log('[SW] Timer stopped by client.');
            // Optionally clear any pending notifications or update clients that timer stopped
             updateClientsWithTimer(0); // Or current duration if meant to be a pause
        }
    } else if (event.data.type === 'REQUEST_TIMER_STATUS') {
        // Client requests current timer status (e.g., on page load/reconnect)
        if (timerInterval && timerEndTime > Date.now()) {
            const remaining = Math.max(0, Math.round((timerEndTime - Date.now()) / 1000));
            event.source.postMessage({ type: 'TIMER_UPDATE', remaining: remaining, duration: timerDuration });
        } else {
             event.source.postMessage({ type: 'TIMER_UPDATE', remaining: 0, duration: timerDuration }); // No active timer or expired
        }
    }
});

console.log('[SW] Service Worker loaded and message listener added.');
