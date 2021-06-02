const staticAssets = [
  './',
  './peerjs/peerjs.min.js',
  './dunplab-manifest-31210.json',
  './dygraph/dygraph-combined.js',
  './excanvas.js',
  './jquery/1.7.2/jquery.min.js',
  './jquery.mobile/1.2.1/jquery.mobile-1.2.1.min.js'
]

self.addEventListener('install', async event=> {
  console.log('install');
  const cache = await caches.open('smoker-static');
  cache.addAll(staticAssets);
});

self.addEventListener('fetch', event => {
  console.log('fetch');
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin == location.origin){
    event.respondWith(cacheFirst(req));
  } else{
    event.respondWith(networkFirst(req));
  }
});

async function cacheFirst(req) {
  const cachedResponse = await caches.match(req);
  return cachedResponse || fetch(req);
}

async function networkFirst(req){
  const cache = await caches.open('smoker-dynamic');

  try {
    const res = await fetch(req);
    cache.put(req, res.clone());
    return res;
  } catch (error) {
    return await cache.match(req);
  }
}
