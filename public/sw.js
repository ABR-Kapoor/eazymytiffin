const CACHE_NAME = "eazymytiffin-v3";
const STATIC_ASSETS = [
  "/",
  "/?source=pwa",
  "/manifest.json",
  "/favicon.ico",
  "/eazymytiffin-logo.png",
];
const API_CACHE = "eazymytiffin-api-v1";

// Install: cache static assets + skip waiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches + enable navigation preload
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Clean old caches
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== API_CACHE)
          .map((k) => caches.delete(k))
      );
      // Enable navigation preload for faster page loads
      try {
        await self.registration.navigationPreload.enable();
      } catch {
        // Navigation preload not supported
      }
      await self.clients.claim();
    })()
  );
});

// Message handler: auth sync from web app
self.addEventListener("message", (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  if (type === "AUTH_SYNC") {
    // Cache auth state so PWA loads faster on next launch
    const authCache = new Response(JSON.stringify(payload), {
      headers: { "Content-Type": "application/json", "X-SW-Cache": "auth" },
    });
    caches.open(API_CACHE).then((cache) => {
      cache.put("/_sw/auth-state", authCache);
    });
  }

  if (type === "CLEAR_AUTH") {
    caches.open(API_CACHE).then((cache) => {
      cache.delete("/_sw/auth-state");
    });
  }

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Fetch: network-first for navigations (with preload), cache-first for static
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Only handle same-origin GET requests
  if (event.request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  // Internal SW cache requests (not real)
  if (url.pathname.startsWith("/_sw/")) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || new Response(null, { status: 204 })
      )
    );
    return;
  }

  // Network-first for API and Next.js internals
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_next/")) {
    event.respondWith(networkFirst(event));
    return;
  }

  // Navigation requests (HTML pages) — use preload response
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          // Try preload response first
          const preloadResponse = await event.preloadResponse;
          if (preloadResponse) return preloadResponse;

          // Fallback to network
          const networkResponse = await fetch(event.request);
          return networkResponse;
        } catch {
          // Offline: serve cached page
          // ignoreSearch: true ensures /?source=pwa matches /
          const cached = await caches.match(event.request, { ignoreSearch: true });
          return cached || (await caches.match("/")) || new Response("Offline", { status: 503 });
        }
      })()
    );
    return;
  }

  // Cache-first for everything else (images, fonts, static assets)
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
    )
  );
});

async function networkFirst(event) {
  try {
    const response = await fetch(event.request);
    if (response && response.status === 200) {
      const clone = response.clone();
      caches.open(API_CACHE).then((cache) => cache.put(event.request, clone));
    }
    return response;
  } catch {
    const cached = await caches.match(event.request);
    return cached || new Response(null, { status: 502 });
  }
}
