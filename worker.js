/* global self, fetch, caches */

const CACHE_VERSION = 1;
const CURRENT_CACHES = {
  offline: `offline-v${CACHE_VERSION}`,
};
const OFFLINE_URL = '/index.html';

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open('gametime-player').then(function (cache) {
      return fetch(event.request).then(function (response) {
        cache.put(event.request, response.clone())
        return response
      }).catch(function () {
        return cache.match(event.request)
      })
    })
  )
});

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(
        [
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
        ]
      );
    })
  );
})
