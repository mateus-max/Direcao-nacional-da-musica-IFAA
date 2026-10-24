const CACHE_NAME="dnm-shell-v2";
const CORE_FILES=["./","./index.html","./manifest-dnm.webmanifest","./icons/dnm-pwa-192.png","./icons/logo-jesus-luz.svg"];
self.addEventListener("install",event=>{
 event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_FILES).catch(()=>{})).then(()=>self.skipWaiting()));
});
self.addEventListener("activate",event=>{
 event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener("fetch",event=>{
 const request=event.request;
 if(request.method!=="GET")return;
 const url=new URL(request.url);
 if(url.origin!==self.location.origin)return;
 /* Always fetch HTML documents fresh: the board contains the actual application code.
    The old cache-first handler kept serving stale quadro.html after GitHub updates. */
 if(request.mode==="navigate"||/\\.html?$/i.test(url.pathname)){
  event.respondWith(fetch(request,{cache:"no-store"}).then(response=>{
   if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));}
   return response;
  }).catch(()=>caches.match(request).then(cached=>cached||caches.match("./index.html").then(home=>home||caches.match("./")))));
  return;
 }
 /* Cache only the app shell and static assets, not live data or HTML application code. */
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{
  if(response.ok&&/\\.(css|js|webmanifest|png|svg|ico|woff2?)$/i.test(url.pathname)){
   const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy));
  }
  return response;
 })));
});
