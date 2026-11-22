const V = "cf-pwa-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "fonts.css", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "fonts/barlow-condensed-latin-500-normal.woff2", "fonts/barlow-condensed-latin-600-normal.woff2", "fonts/barlow-condensed-latin-700-normal.woff2", "fonts/barlow-latin-400-normal.woff2", "fonts/barlow-latin-500-normal.woff2", "fonts/barlow-latin-600-normal.woff2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  const heavy = r.url.includes("/ocr/");
  e.respondWith(caches.open(V).then(async c => {
    const hit = await c.match(r, {ignoreSearch: true});
    const net = fetch(r).then(res => { if (res && res.ok && res.status === 200) c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { if (!heavy) e.waitUntil(net); return hit; }
    const res = await net; if (res) return res;
    if (r.mode === "navigate") { const i = await c.match("index.html"); if (i) return i; }
    return new Response("Sin conexión", {status: 503});
  }));
});
