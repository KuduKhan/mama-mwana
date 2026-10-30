/* MamaMwana demo-only offline shell. DO NOT cache Auth, API, patient content or requests. */
const NAME='mamamwana-public-demo-v2.0.0-beta.12';
const PUBLIC=['/','/icon.svg','/manifest.webmanifest','/learning/mamamwana-public-guide-v204.txt','/learning/mamamwana-learning-essentials-v209.txt'];
const isAsset=(url)=>url.origin===self.location.origin&&/^\/assets\/[A-Za-z0-9_-]+\.(js|css)$/.test(url.pathname);
self.addEventListener('install',event=>{
 event.waitUntil(caches.open(NAME).then(cache=>cache.addAll(PUBLIC)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',event=>{
 event.waitUntil(Promise.all([
  caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('mamamwana-public-demo-')&&key!==NAME).map(key=>caches.delete(key)))),
  self.clients.claim()
 ]));
});
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET'||new URL(req.url).origin!==self.location.origin)return;
 const url=new URL(req.url);
 if(req.mode==='navigate'){
  event.respondWith(fetch(req).then(response=>response).catch(async()=>{
   return await caches.match('/')||Response.error();
  }));
  return;
 }
 if(!isAsset(url)&&!PUBLIC.includes(url.pathname))return;
 event.respondWith(caches.open(NAME).then(async cache=>{
  const cached=await cache.match(req);
  if(cached)return cached;
  try{
   const response=await fetch(req);
   if(response.ok&&response.type==='basic')await cache.put(req,response.clone());
   return response;
  }catch{return Response.error();}
 }));
});
self.addEventListener('message',event=>{
 if(event.data?.type!=='PRECACHE_DEMO_ASSETS'||!Array.isArray(event.data.paths))return;
 const paths=event.data.paths.slice(0,30).filter(path=>{
  if(typeof path!=='string'||!path.startsWith('/'))return false;
  return isAsset(new URL(path,self.location.origin));
 });
 event.waitUntil(caches.open(NAME).then(cache=>Promise.all(paths.map(path=>cache.add(path).catch(()=>{})))));
});
