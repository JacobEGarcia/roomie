/* ROOMIE service worker - cache-first, offline-capable */
const CACHE = 'roomie-v6';
const ASSETS = [
  './', './index.html', './manifest.webmanifest', './favicon.png',
  './8-icon-192.png', './9-icon-512.png', './10-icon-512-maskable.png',
  './room.jpg', './room_day.jpg',
  './idle.png', './wave.png', './stretch.png', './phone.png', './read.png',
  './tea.png', './sleep.png', './2-prone.png', './3-lookup.png', './4-yawn.png',
  './5-kiss.png', './6-squat.png'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: e.request.url.includes('index.html') }).then(hit => {
      return hit || fetch(e.request).then(res => {
        if (res.ok && e.request.url.startsWith(self.location.origin)) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
