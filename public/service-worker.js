importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const CACHE = "pwabuilder-page";
const offlineFallbackPage = "/offline.html"; // Ensure this file exists

self.addEventListener("message", (event) => {
    if (event.data && event.data.type === "SKIP_WAITING") {
        self.skipWaiting();
    }
});

self.addEventListener('install', async (event) => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(CACHE)
            .then((cache) => {
                console.log('Caching offline page...');
                return cache.add(offlineFallbackPage);
            })
    );
});

if (workbox.navigationPreload.isSupported()) {
    workbox.navigationPreload.enable();
}

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith((async () => {
            try {
                const preloadResp = await event.preloadResponse;

                if (preloadResp) {
                    return preloadResp;
                }

                const networkResp = await fetch(event.request);
                return networkResp;
            } catch (error) {
                console.error('Fetch failed; returning offline page instead.', error);
                const cache = await caches.open(CACHE);
                const cachedResp = await cache.match(offlineFallbackPage);
                return cachedResp;
            }
        })());
    }
});

self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-messages') {
        event.waitUntil(syncMessages());
    }
});

async function syncMessages() {
    const messagesToSync = await getMessagesFromIndexedDB(); // Assume you store messages in IndexedDB
    for (const message of messagesToSync) {
        await fetch('/send-message', {
            method: 'POST',
            body: JSON.stringify({ message }),
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
}

// Storing messages in IndexedDB
function storeMessage(message) {
    const request = indexedDB.open('my-database', 1);

    request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create the object store if it doesn't exist
        db.createObjectStore('messages', { keyPath: 'id', autoIncrement: true });
    };

    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['messages'], 'readwrite');
        const store = transaction.objectStore('messages');
        store.add({ message });
    };
}

// Retrieve messages from IndexedDB
async function getMessagesFromIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('my-database', 1);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['messages'], 'readonly');
            const store = transaction.objectStore('messages');
            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
            };
            getAllRequest.onerror = () => {
                reject(getAllRequest.error);
            };
        };
    });
}
