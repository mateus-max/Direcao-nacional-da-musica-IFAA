const CACHE_NAME="dnm-shell-v11";
const CORE_FILES=["./","./index.html","./ensaio.html","./ensaios/","./ensaios/index.html","./manifest-dnm.webmanifest","./manifest-ensaios.webmanifest","./icons/dnm-pwa-192.png","./icons/logo-jesus-luz.svg"];
self.addEventListener("install",event=>{event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(CORE_FILES).catch(()=>{})).then(()=>self.skipWaiting()))});
self.addEventListener("activate",event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",event=>{
 const request=event.request;if(request.method!=="GET")return;
 const url=new URL(request.url);if(url.origin!==self.location.origin)return;
 const path=url.pathname.toLowerCase();
 /* Always fetch HTML fresh: stale quadro.html was being served after GitHub updates. */
 if(request.mode==="navigate"||path.endsWith(".html")||path.endsWith(".htm")){
  event.respondWith(fetch(request,{cache:"no-store"}).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy))}return response}).catch(()=>caches.match(request).then(cached=>cached||caches.match("./index.html").then(home=>home||caches.match("./")))));return;
 }
 /* Cache only static assets; never cache application HTML through this branch. */
 const staticAsset=[".css",".js",".webmanifest",".png",".svg",".ico",".woff",".woff2"].some(ext=>path.endsWith(ext));
 if(!staticAsset){event.respondWith(fetch(request));return}
 event.respondWith(caches.match(request).then(cached=>cached||fetch(request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE_NAME).then(cache=>cache.put(request,copy))}return response})));
});