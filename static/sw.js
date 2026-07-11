const CACHE_NAME = 'robo-dashboard-v4';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './blockly_compressed.js',
  './en.js',
  './manifest.json',
  './lib/tf.min.js',
  './lib/coco-ssd.min.js',
  './models/model.json',
  './models/group1-shard1of5',
  './models/group1-shard2of5',
  './models/group1-shard3of5',
  './models/group1-shard4of5',
  './models/group1-shard5of5'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Never cache API requests
  if (event.request.url.includes('/api/')) {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
