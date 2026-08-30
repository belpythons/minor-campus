/* =====================================================================
   Service worker — Student Hub
   ---------------------------------------------------------------------
   Deliberately hand-written rather than generated, because this app has
   one hard rule: authenticated, per-user data must never be served from
   a cache. Getting another student's logbook out of a stale cache would
   be worse than being offline.

   Strategy:
     - navigations        -> network first, offline page as fallback
     - build assets       -> cache first (immutable, hashed filenames)
     - icons / manifest   -> stale-while-revalidate
     - Supabase & APIs    -> never touched
   ===================================================================== */

const VERSION = "v3";
const SHELL_CACHE = `shell-${VERSION}`;
const ASSET_CACHE = `assets-${VERSION}`;
const OFFLINE_URL = "/offline";

const PRECACHE = [
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/logo.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/maskable-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Individually, so one 404 cannot abort the whole install.
      await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: "reload" }))));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== SHELL_CACHE && k !== ASSET_CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

/** Requests the worker must stay out of entirely. */
function isBypassed(url, request) {
  if (request.method !== "GET") return true;
  if (url.origin !== self.location.origin) return true; // Supabase, fonts, CDNs
  if (url.pathname.startsWith("/api/")) return true; // exports carry user data
  if (url.pathname.startsWith("/auth/")) return true;
  if (url.pathname.startsWith("/print/")) return true; // must always be fresh
  if (url.searchParams.has("_rsc")) return true; // RSC payloads
  return false;
}

function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isPublicAsset(url) {
  return (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/logo.png" ||
    url.pathname === "/manifest.webmanifest"
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (isBypassed(url, request)) return;

  // ---- Page navigations: always try the network first. -------------------
  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          const offline = await cache.match(OFFLINE_URL);
          return (
            offline ??
            new Response("Anda sedang offline.", {
              status: 503,
              headers: { "Content-Type": "text/plain; charset=utf-8" },
            })
          );
        }
      })(),
    );
    return;
  }

  // ---- Hashed build output: cache first, it can never go stale. ----------
  if (isImmutableAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(ASSET_CACHE);
        const hit = await cache.match(request);
        if (hit) return hit;

        const res = await fetch(request);
        if (res.ok) cache.put(request, res.clone());
        return res;
      })(),
    );
    return;
  }

  // ---- Icons & manifest: serve fast, refresh in the background. ----------
  if (isPublicAsset(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL_CACHE);
        const hit = await cache.match(request);

        const network = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => hit);

        return hit ?? network;
      })(),
    );
  }
});
