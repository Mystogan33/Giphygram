/* jshint esversion: 7 */
// SW Version
const version = '1.0';

// Static cache - App Shell
const appAssets = [
  'index.html',
  'main.js',
  'images/flame.png',
  "images/logo.png",
  "images/sync.png",
  "vendor/bootstrap.min.css",
  "vendor/jquery.min.js"
];

const staticCache = (req, cacheName = `static-${version}`) => {
  // Fetch the cached data
  return caches.match(req).then(cachedRes => {
    if(cachedRes) return cachedRes;

    // Fallback to network
    return fetch(req).then(networkRes => {
      // Update cache with fresh data
      caches.open(cacheName)
      .then(cache => cache.put(req, networkRes));

      // Return fresh data
      return networkRes.clone();
    });
  });
};

const fallbackCache = (req) => {

  // Try network
  return fetch(req)
    .then(networkRes => {
      // Check res
      if(!networkRes.ok) throw 'Fetch Error';

      // Update cache
      caches.open(`static-${version}`)
        .then(cache => cache.put(req, networkRes));

      return networkRes.clone();
    })
  // Try cache
    .catch(err => caches.match(req));
};

const cleanGiphyCache = (giphys) => {
  caches.open('giphy').then(cache => {
    // Get all cache entries
    cache.keys().then(keys => {
      // Loop entries(requests)
      keys.forEach(key => {
        // If entry is NOT part of current Giphys, Delete
        if(!giphys.includes(key.url)) cache.delete(key);
      });
    });
  });
};

// SW Install
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(`static-${version}`)
    .then(cache => cache.addAll(appAssets))
  );
});

self.addEventListener('activate', e => {
  // Clean static cache
    e.waitUntil(
      caches.keys().then(keys => {
        keys.forEach(key => {
          if(key !== `static-${version}` && key.match('static-')) {
            return caches.delete(key);
          }
        });
      })
    );
    self.skipWaiting();
});

// SW Fetch
self.addEventListener('fetch', e => {
  // If request match local assets
  if(e.request.url.match(location.origin))
    e.respondWith(staticCache(e.request));
  // Giphy API Call
  else if (e.request.url.match('api.giphy.com/v1/gifs/trending'))
    e.respondWith(fallbackCache(e.request));
  else if(e.request.url.match('giphy.com/media'))
    e.respondWith(staticCache(e.request, 'giphy'));
});

self.addEventListener('message', e => {
  // Identify the message
  if(e.data.action === 'cleanGiphyCache') cleanGiphyCache(e.data.giphys);
});
