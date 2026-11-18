const V = 'presupuesto-taller-v3';
const CORE = ['./', 'index.html', 'manifest.webmanifest', 'jspdf.umd.min.js', 'icon-192.png', 'icon-512.png', 'icon-180.png', 'fonts/Barlow-Regular.woff2', 'fonts/Barlow-Medium.woff2', 'fonts/Barlow-SemiBold.woff2', 'fonts/BarlowCondensed-Medium.woff2', 'fonts/BarlowCondensed-SemiBold.woff2', 'fonts/BarlowCondensed-Bold.woff2'];
/* Al instalarse pide siempre los archivos al servidor (sin usar la memoria del navegador) */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => c.addAll(CORE.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  /* Primero el servidor, comprobando siempre si hay una versión nueva (cache: 'no-cache'),
     para que un cambio publicado se vea en la primera visita. Sin conexión, lo guardado. */
  e.respondWith(fetch(r.url, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
    return res;
  }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('index.html'))));
});
