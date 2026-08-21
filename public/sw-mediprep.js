/* MeDiprep PWA — scope /app/priprava */
const CACHE_NAME = "msg-mediprep-v4";
const SHELL = [
  "/mediprep-manifest.json",
  "/assets/mediprep/icon-192.png",
  "/assets/mediprep/icon-512.png",
  "/assets/mediprep/icon-512-maskable.png",
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
          keys.filter((k) => k.startsWith("msg-mediprep") && k !== CACHE_NAME).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

function isApi(url) {
  return url.pathname.startsWith("/api/mediprep");
}

function isAppAsset(url) {
  return url.pathname.startsWith("/assets/mediprep/");
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

  // Never cache-first /_next/* — hashed or stable chunk URLs must stay fresh.
  if (url.pathname.startsWith("/_next/")) {
    return;
  }

  if (isApi(url)) {
    event.respondWith(fetch(req).then((res) => res).catch(() => caches.match(req)));
    return;
  }

  if (isAppAsset(url)) {
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

  // App shell HTML: network-first so control panels always match the deployed build.
  if (url.pathname.startsWith("/app/priprava") || req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok && url.pathname.startsWith("/app/priprava")) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match("/app/priprava")))
    );
  }
});
