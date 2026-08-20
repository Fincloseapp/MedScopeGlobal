/* MeDipacient PWA — scope /app/pacient */
const CACHE_NAME = "msg-pacient-v1";
const SHELL = [
  "/app/pacient",
  "/medipacient-manifest.json",
  "/assets/medipacient/icon-192.png",
  "/assets/medipacient/icon-512.png",
  "/assets/medipacient/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await Promise.all(
        SHELL.map(async (url) => {
          try {
            await cache.add(url);
          } catch {
            /* ignore */
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k.startsWith("msg-pacient") && k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApi(url) {
  return url.pathname.startsWith("/api/medipacient");
}

function isStaticAsset(url) {
  return url.pathname.startsWith("/assets/medipacient/") || url.pathname.startsWith("/_next/static/");
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (isApi(url)) {
    event.respondWith(fetch(req).then((res) => res).catch(() => caches.match(req)));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached;
        return fetch(req).then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  if (url.pathname.startsWith("/app/pacient") || req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/app/pacient")))
    );
  }
});
