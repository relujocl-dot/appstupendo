const STUPENDO_CACHE = "stupendo-pwa-v1";
const STATIC_ASSETS = [
  "/",
  "/agenda/",
  "/finanzas/"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STUPENDO_CACHE)
      .then(cache => cache.addAll(STATIC_ASSETS).catch(() => null))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== STUPENDO_CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.hostname.includes("supabase.co")) return;
  if (url.pathname.includes("/auth/") || url.pathname.includes("/rest/")) return;

  event.respondWith(
    caches.match(request).then(cached => {
      const network = fetch(request).then(response => {
        const copy = response.clone();
        if (response.ok && (request.destination === "style" || request.destination === "script" || request.destination === "image" || request.destination === "document")) {
          caches.open(STUPENDO_CACHE).then(cache => cache.put(request, copy)).catch(() => null);
        }
        return response;
      }).catch(() => cached);
      return cached || network;
    })
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "STUPENDO_CLEAR_CACHE") {
    event.waitUntil(caches.delete(STUPENDO_CACHE));
  }
});
