const CACHE_NAME = "buscaaqui-v1"
const STATIC_CACHE = "buscaaqui-static-v1"
const DYNAMIC_CACHE = "buscaaqui-dynamic-v1"

const STATIC_ASSETS = ["/", "/offline", "/manifest.json"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE).map((key) => caches.delete(key)),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - cache strategies
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") return

  // API requests - Network First with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clonedResponse = response.clone()
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, clonedResponse)
          })
          return response
        })
        .catch(() => {
          return caches.match(request)
        }),
    )
    return
  }

  // Static assets - Cache First
  if (url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff2?)$/) || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            const clonedResponse = response.clone()
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, clonedResponse)
            })
            return response
          })
        )
      }),
    )
    return
  }

  // HTML pages - Network First with offline fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clonedResponse = response.clone()
        caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(request, clonedResponse)
        })
        return response
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          return cached || caches.match("/offline")
        })
      }),
  )
})
