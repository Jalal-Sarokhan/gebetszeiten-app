/* Service Worker – App-Shell cache-first, Jahres-CSV network-first */
const CACHE = "gebetszeiten-v4";
const SHELL = [
    "./",
    "index.html",
    "styles.css",
    "app.js",
    "manifest.json",
    "icon.png",
    "bild.jpg",
    "azan.mp3",
    "gebetszeiten_2025.csv"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;

    // Jahres-CSV (auch von GitHub): network-first, Fallback auf Cache
    if (/gebetszeiten_\d{4}\.csv/.test(req.url)) {
        event.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE).then((c) => c.put(req, copy));
                    return res;
                })
                .catch(() => caches.match(req).then((r) => r || caches.match("gebetszeiten_2025.csv")))
        );
        return;
    }

    // App-Shell: cache-first, Netzwerk-Fallback, offline -> index.html
    event.respondWith(
        caches.match(req).then((res) =>
            res || fetch(req).catch(() => caches.match("index.html"))
        )
    );
});
