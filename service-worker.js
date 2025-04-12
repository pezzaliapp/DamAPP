self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('damapp-cache').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/app.js',
        '/manifest.json',
        '/icon/DamAPP-192.png',
        '/icon/DamAPP-512.png'
      ]);
    })
  );
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
