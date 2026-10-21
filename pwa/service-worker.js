// Template for sw.js. The build replaces the two placeholders with a version and the exact list of built files.
const CACHE_NAME = "faisca-__CACHE_VERSION__";
const PRECACHE_URLS = __PRECACHE_URLS__;

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_URLS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((names) => Promise.all(names.filter((name) => name.startsWith("faisca-") && name !== CACHE_NAME).map((name) => caches.delete(name))))
            .then(() => self.clients.claim())
    );
});

// The page itself goes to the network first, so a new version shows up as soon as there is a connection,
// and falls back to the cached copy offline. Built files carry a content hash in their name, so the cache
// always answers them.
self.addEventListener("fetch", (event) => {
    const { request } = event;
    if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) {
        return;
    }
    if (request.mode === "navigate") {
        event.respondWith(fetch(request).catch(() => caches.match("./")));
        return;
    }
    event.respondWith(caches.match(request).then((cached) => (cached === undefined ? fetch(request) : cached)));
});
