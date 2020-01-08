'use strict';
/**
 * Cyril-xd offline service worker
 *
 * Based on https://googlechrome.github.io/samples/service-worker/custom-offline-page/index.html.
 */

// Incrementing CACHE_VERSION will kick off the install event and force
// previously cached resources to be cached again.
const CACHE_VERSION = 3;
const CURRENT_CACHES = {
  offline: `offline-v${CACHE_VERSION}`,
};
const filesToCache = [
  '/',
  '/icons/512..png',
  '/jspm_packages/system.js',
  '/jspm_packages/system.src.js',
  '/jspm_packages/npm/vba-next@1.0.0.js',
  '/jspm_packages/npm/snes9x-next@1.0.0.js',
  '/jspm_packages/npm/process@0.11.10.js',
  '/jspm_packages/npm/localforage@1.5.3.js',
  '/jspm_packages/npm/gambatte@1.0.0.js',
  '/jspm_packages/npm/vba-next@1.0.0/core.js',
  '/jspm_packages/npm/vba-next@1.0.0/retro.js',
  '/jspm_packages/npm/snes9x-next@1.0.0/core.js',
  '/jspm_packages/npm/snes9x-next@1.0.0/retro.js',
  '/jspm_packages/npm/gambatte@1.0.0/core.js',
  '/jspm_packages/npm/gambatte@1.0.0/retro.js',
  '/jspm_packages/npm/process@0.11.10/browser.js',
  '/jspm_packages/npm/localforage@1.5.3/dist/localforage.js',
  '/jspm_packages/npm/core-js@1.2.7/library/modules/$.js',
  '/jspm_packages/npm/core-js@1.2.7/library/fn/object/create.js',
  '/jspm_packages/npm/babel-runtime@5.8.38/core-js/object/create.js',
  '/jspm_packages/github/jspm/nodelibs-process@0.1.2.js',
  '/jspm_packages/github/jspm/nodelibs-process@0.1.2/index.js',
  '/jspm_packages/github/webcomponents/webcomponentsjs@0.7.24.js',
  '/jspm_packages/github/webcomponents/webcomponentsjs@0.7.24/webcomponents-lite.js',
  '/jspm_packages/github/stuk/jszip@2.6.1.js',
  '/jspm_packages/github/stuk/jszip@2.6.1/dist/jszip.js',
  '/jspm_packages/github/satazor/js-spark-md5@1.0.1.js',
  '/jspm_packages/github/satazor/js-spark-md5@1.0.1/spark-md5.js',
  '/jspm_packages/github/mohayonao/web-audio-api-shim@0.3.0.js',
  '/jspm_packages/github/mohayonao/web-audio-api-shim@0.3.0/build/web-audio-api-shim.js',
  '/jspm_packages/github/mattherbauer/document@0.0.4/document.js',
  '/jspm_packages/github/mattherbauer/window@0.0.3/window.js',
  '/jspm_packages/github/mattherbauer/x-retro@master/x-retro.js',
  '/jspm_packages/github/mattherbauer/x-retro@master/player.coffee',
  '/build.js',
  '/config.js',
  '/index.coffee',
  '/index.css',
  '/settings.json',
  '/utils.js'
  
];

const staticCacheName = 'pages-cache-v1';

self.addEventListener('install', event => {
  console.log('Attempting to install service worker and cache static assets');
  event.waitUntil(
    caches.open(staticCacheName)
    .then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

function createCacheBustedRequest(url) {
  const request = new Request(url, { cache: 'reload' });
  // See https://fetch.spec.whatwg.org/#concept-request-mode
  // This is not yet supported in Chrome as of M48, so we need to explicitly
  // check to see if the cache: 'reload' option had any effect.
  if ('cache' in request) {
    return request;
  }
  
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
