'use strict';
/**
 * Cyril-xd offline service worker
 *
 * Based on https://googlechrome.github.io/samples/service-worker/custom-offline-page/index.html.
 */

// Incrementing CACHE_VERSION will kick off the install event and force
// previously cached resources to be cached again.
const CACHE_VERSION = 1;
const CURRENT_CACHES = {
  offline: `offline-v${CACHE_VERSION}`,
};
const OFFLINE_URL = '/index.html';

function createCacheBustedRequest(url) {
  const request = new Request(url, { cache: 'reload' });
  // See https://fetch.spec.whatwg.org/#concept-request-mode
  // This is not yet supported in Chrome as of M48, so we need to explicitly
  // check to see if the cache: 'reload' option had any effect.
  if ('cache' in request) {
    return request;
  }
this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v1').then(function(cache) {
      return cache.add('/index.css');
    })
  );
});
          


  // If {cache: 'reload'} didn't have any effect, append a cache-busting URL
  // parameter instead.
  const bustedUrl = new URL(url, self.location.href);
  bustedUrl.search += `${bustedUrl.search ? '&' : ''}cachebust=${Date.now()}`;
  return new Request(bustedUrl);
}

self.addEventListener('install', event => {
  event.waitUntil(
    // We can't use cache.add() here, since we want OFFLINE_URL to be the cache
    // key, but the actual URL we end up requesting might include a
    // cache-busting parameter.
    fetch(createCacheBustedRequest(OFFLINE_URL)).then(response => {
      return caches.open(CURRENT_CACHES.offline).then(cache => {
        return cache.put(OFFLINE_URL, response);
      });
    }),
  );
});

self.addEventListener('activate', event => {
  // Delete all caches that aren't named in CURRENT_CACHES.
  // While there is only one cache in this example, the same logic will handle
  // the case where there are multiple versioned caches.
  const expectedCacheNames = Object.keys(CURRENT_CACHES).map(key => {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (expectedCacheNames.indexOf(cacheName) === -1) {
            // If this cache name isn't present in the array of "expected"
            // cache names, then delete it.
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        }),
      );
    }),
  );
});

self.addEventListener('fetch', event => {
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  // request.mode of 'navigate' is unfortunately not supported in Chrome
  // versions older than 49, so we need to include a less precise fallback,
  // which checks for a GET request with an Accept: text/html header.
  if (
    event.request.mode === 'navigate' ||
    (event.request.method === 'GET' &&
      event.request.headers.get('accept').includes('text/html'))
  ) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // The catch is only triggered if fetch() throws an exception, which
        // will most likely happen due to the server being unreachable.
        // If fetch() returns a valid HTTP response with an response code in
        // the 4xx or 5xx range, the catch() will NOT be called.
        return caches.match(OFFLINE_URL);
      }),
    );
  }

  // If our if() condition is false, then this fetch handler won't intercept
  // the request.
  // If there are any other fetch handlers registered, they will get a chance
  // to call event.respondWith(). If no fetch handlers call event.respondWith(),
  // the request will be handled by the browser as if there were no service
  // worker involvement.
});
