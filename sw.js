// self.addEventListener("install", event => {
//     event.waitUntil(
//         caches.open("v1").then(cache => {
//             return cache.addAll(["/", "index.html", "styles.css", "app.js", "gebetszeiten_2025.csv", "azan.mp3"]);
//         })
//     );
// });

// self.addEventListener("fetch", event => {
//     event.respondWith(
//         caches.match(event.request).then(response => {
//             return response || fetch(event.request).catch(() => caches.match("index.html"));
//         })
//     );
// });
self.addEventListener("install", event => {
    console.log("Service Worker installiert.");
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    console.log("Service Worker aktiviert.");
});

self.addEventListener("fetch", event => {
    console.log("Anfrage abgefangen:", event.request.url);
});
