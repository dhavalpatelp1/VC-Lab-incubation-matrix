const CACHE = 'epilab-v1';
const OFFLINE_HTML = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline — EpiLab</title><style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;padding:2rem;background:#0b1220;color:#d1e5ff} .card{max-width:600px;margin:0 auto;background:#121a2b;border:1px solid #2b3a5a;border-radius:16px;padding:1rem}.muted{color:#9db4d1}</style><div class="card"><h1>You're offline</h1><p class="muted">Your incubations are saved in your browser and will sync when you're back online. Calendar links need internet.</p></div>`;
self.addEventListener('install', (event) => {
  event.waitUntil((async () => { self.skipWaiting(); const cache = await caches.open(CACHE); await cache.put('offline', new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } })); })());
});
self.addEventListener('activate', (event) => { event.waitUntil(clients.claim()); });
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.mode === 'navigate') {
    event.respondWith((async () => {
      try { return await fetch(req); } catch (e) { const cache = await caches.open(CACHE); const match = await cache.match('offline'); return match || new Response(OFFLINE_HTML, { headers: { 'Content-Type': 'text/html' } }); }
    })());
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try { const fresh = await fetch(req); if (req.method === 'GET' && fresh && fresh.ok) cache.put(req, fresh.clone()); return fresh; }
    catch (e) { const cached = await cache.match(req); if (cached) return cached; throw e; }
  })());
});
