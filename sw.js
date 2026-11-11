const V='hq-v7';
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(['./','manifest.webmanifest'])));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
// Only HQ's own files are cached. Google Sheet / Apps Script calls always go to the network,
// so an old copy of your data is never served as if it were fresh.
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET')return;
 if(new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{
  if(r&&r.ok){const c=r.clone();caches.open(V).then(x=>x.put(e.request,c))}
  return r;
 }).catch(()=>caches.match(e.request)));
});
