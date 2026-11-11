/* Galaxy Point PWA — automatic updates. Network-first HTML, safe offline fallback. */
const CACHE='galaxy-point-pwa-shell-v3';
const SHELL=['./','./index.html','./manifest.webmanifest','./pwa-icon.svg'];
self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('galaxy-point-pwa-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET')return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin)return;
  if(/\/(?:dashboard|editor)\.html$/.test(url.pathname)||url.pathname.includes('/api/'))return;
  if(req.mode==='navigate'){
    event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
      return response;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html'))));
    return;
  }
  if(/\/(?:manifest\.webmanifest|pwa-icon\.svg|icon-(?:192|512)\.png|apple-touch-icon\.png)$/.test(url.pathname)){
    event.respondWith(fetch(req,{cache:'no-store'}).then(response=>{
      if(response.ok){const copy=response.clone();event.waitUntil(caches.open(CACHE).then(cache=>cache.put(req,copy)));}
      return response;
    }).catch(()=>caches.match(req)));
  }
});
