const V = 'presupuesto-taller-v1';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'jspdf.umd.min.js', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin === location.origin) {
    // primero la red (para recibir mejoras); sin conexión, lo guardado
    e.respondWith(fetch(r).then(res => {
      const cp = res.clone();
      caches.open(V).then(c => c.put(r, cp));
      return res;
    }).catch(() => caches.match(r).then(m => m || caches.match('index.html'))));
  } else if (u.host === 'fonts.googleapis.com' || u.host === 'fonts.gstatic.com') {
    e.respondWith(caches.open(V).then(c => c.match(r).then(m => m || fetch(r).then(res => { c.put(r, res.clone()); return res; }))));
  }
});
