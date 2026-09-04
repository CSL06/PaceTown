/**
 * PaceTown offline shell (prototype).
 *
 * Runtime cache-first for same-origin GET requests, populated on first visit.
 * Navigations that fail while offline fall back to the cached app shell.
 * Version the cache name to invalidate: bump CACHE to pacetown-v2, etc.
 */

const CACHE = 'pacetown-v2'
const SHELL = '/'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.add(SHELL)).then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        })
        .catch(() => {
          if (request.mode === 'navigate') return caches.match(SHELL)
          return cached
        })
      return cached || network
    }),
  )
})
