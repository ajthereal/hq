const V='hq-v12';
const SHELL=['./','manifest.webmanifest','icons/icon-192.png','icons/apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(u).catch(()=>{})))));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))));self.clients.claim()});
// Only HQ's own files are cached. Google Sheet / Apps Script calls always go to the network,
// so an old copy of your data is never served as if it were fresh.
// Network first, so a new deploy shows up right away. If the network is slow (over 4 seconds) or off,
// the saved copy opens instead, so HQ never sits on a blank screen. Works for /index.html and ?query URLs too.
self.addEventListener('fetch',e=>{
 const req=e.request;
 if(req.method!=='GET')return;
 if(new URL(req.url).origin!==self.location.origin)return;
 e.respondWith(new Promise(res=>{
  let done=false;
  const give=r=>{if(!done){done=true;res(r)}};
  const cached=()=>caches.match(req,{ignoreSearch:true}).then(m=>m||(req.mode==='navigate'?caches.match('./'):null));
  const t=setTimeout(()=>{cached().then(m=>{if(m)give(m)})},4000);
  fetch(req,{cache:'no-cache'}).then(r=>{
   clearTimeout(t);
   if(r&&r.ok){const c=r.clone();caches.open(V).then(x=>x.put(req,c))}
   give(r);
  }).catch(()=>{clearTimeout(t);cached().then(m=>give(m||Response.error()))});
 }));
});
