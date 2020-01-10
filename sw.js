/*
Copyright 2015, 2019 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/

// Incrementing OFFLINE_VERSION will kick off the install event and force
// previously cached resources to be updated from the network.
const OFFLINE_VERSION = 1;
const CACHE_NAME = 'offline';
// Customize this with a different URL if needed.
const OFFLINE_URL = 'index.html';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(
        [
          './',
          '/icons/512.png',
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
          '/build.js',
          '/config.js',
          '/index.coffee',
          '/index.css',
          '/settings.json',
          '/utils.js'
        ]
      );
    })
  );
});

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // Setting {cache: 'reload'} in the new request will ensure that the response
    // isn't fulfilled from the HTTP cache; i.e., it will be from the network.
    await cache.add(new Request(OFFLINE_URL, {cache: 'reload'}));
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Enable navigation preload if it's supported.
    // See https://developers.google.com/web/updates/2017/02/navigation-preload
    if ('navigationPreload' in self.registration) {
      await self.registration.navigationPreload.enable();
    }
  })());

  // Tell the active service worker to take control of the page immediately.
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // We only want to call event.respondWith() if this is a navigation request
  // for an HTML page.
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        // First, try to use the navigation preload response if it's supported.
        const preloadResponse = await event.preloadResponse;
        if (preloadResponse) {
          return preloadResponse;
        }

        const networkResponse = await fetch(event.request);
        return networkResponse;
      } catch (error) {
        // catch is only triggered if an exception is thrown, which is likely
        // due to a network error.
        // If fetch() returns a valid HTTP response with a response code in
        // the 4xx or 5xx range, the catch() will NOT be called.
        console.log('Fetch failed; returning offline page instead.', error);

        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(OFFLINE_URL);
        return cachedResponse;
      }
    })());
  }

  // If our if() condition is false, then this fetch handler won't intercept the
  // request. If there are any other fetch handlers registered, they will get a
  // chance to call event.respondWith(). If no fetch handlers call
  // event.respondWith(), the request will be handled by the browser as if there
  // were no service worker involvement.
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
