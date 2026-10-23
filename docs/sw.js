// Template for sw.js. The build replaces the two placeholders with a version and the exact list of built files.
const CACHE_NAME = "faisca-c44f887b11b5";
const PRECACHE_URLS = [
    "./",
    "./assets/index-CBA9y3kD.css",
    "./assets/index-Cl0-KOyC.js",
    "./assets/nunito-cyrillic-ext-wght-normal-D4X5GqEv.woff2",
    "./assets/nunito-cyrillic-wght-normal-CY6AOgYE.woff2",
    "./assets/nunito-latin-ext-wght-normal-CXYtwYOx.woff2",
    "./assets/nunito-latin-wght-normal-BzFMHfZw.woff2",
    "./assets/nunito-vietnamese-wght-normal-U01xdrZh.woff2",
    "./favicon.svg",
    "./icons/apple-touch-icon.png",
    "./icons/favicon-32.png",
    "./icons/icon-192.png",
    "./icons/icon-512.png",
    "./icons/icon-maskable-512.png",
    "./manifest.webmanifest",
    "./og-image.png"
];

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
