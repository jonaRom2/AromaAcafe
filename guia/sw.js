/* Guía del Café · Aroma a Café — funciona sin internet.
   Para publicar una actualización: cambie VERSION (por ejemplo "guia-v2") y suba los archivos. */
const VERSION = "guia-v1";
const FILES = [
  "./", "./index.html", "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png",
  "./fonts/eb-garamond-latin-500-normal.woff2", "./fonts/eb-garamond-latin-600-normal.woff2", "./fonts/eb-garamond-latin-500-italic.woff2",
  "./fonts/lato-latin-400-normal.woff2", "./fonts/lato-latin-700-normal.woff2", "./fonts/lato-latin-900-normal.woff2"
];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES))); });
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("message", (e) => { if (e.data === "activar") self.skipWaiting(); });
self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(req).then((hit) => hit || fetch(req)));
});
