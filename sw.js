const CACHE = 'true-v21';
const SHELL = ['./index.html', './beta.html', './feedback.html', './manifest.json', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// HTML: network-first so deploys arrive on the next load; cache is the
// offline fallback. Static assets: cache-first for speed.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Cross-origin (CDN, AI model shards) is never ours to cache — WebLLM
  // manages its own model cache, and copying ~700MB into this one would
  // get wiped on every version bump.
  if (new URL(e.request.url).origin !== self.location.origin) return;
  const isPage = e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').includes('text/html');
  if (isPage) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request).then(hit => hit || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => undefined))
  );
});
