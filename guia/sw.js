/* Guía del Café · Aroma a Café — funciona sin internet.
   Para publicar una actualización: cambie VERSION (guia-v5, guia-v6…) y suba los archivos. */
const VERSION = "guia-v4";
const CORE = ["./index.html"];
const EXTRA = [
  "./manifest.webmanifest",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/icon-maskable-512.png", "./icons/apple-touch-icon.png",
  "./fonts/eb-garamond-latin-500-normal.woff2", "./fonts/eb-garamond-latin-600-normal.woff2", "./fonts/eb-garamond-latin-500-italic.woff2",
  "./fonts/lato-latin-400-normal.woff2", "./fonts/lato-latin-700-normal.woff2", "./fonts/lato-latin-900-normal.woff2"
];

// Instalar: la página es obligatoria; íconos y fuentes se guardan si están disponibles
// (si alguno falla, la guía igual queda lista para usarse sin internet).
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSION).then(async (c) => {
    await c.addAll(CORE.map((u) => new Request(u, { cache: "reload" })));
    await Promise.allSettled(EXTRA.map((u) => c.add(new Request(u, { cache: "reload" }))));
  }));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k.startsWith("guia-") && k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("message", (e) => { if (e.data === "activar") self.skipWaiting(); });

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;

  // Abrir la guía: SIEMPRE desde la copia guardada en el teléfono (instantáneo, con o sin señal).
  // Las actualizaciones llegan cuando se sube un sw.js con otra VERSION.
  if (req.mode === "navigate") {
    e.respondWith(caches.open(VERSION).then((c) => c.match("./index.html")).then((hit) => hit || fetch(req)));
    return;
  }

  // Íconos, fuentes y demás: primero la copia guardada; si no está, de internet y se guarda.
  e.respondWith(caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req).then((res) => {
    if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
    return res;
  })));
});
