import {authConfigured} from './supabase';
/** Demo-only caching of generic public assets. Never cache data responses or patient records. */
export async function setupDemoOfflineShell(){
 if(!('serviceWorker' in navigator))return;
 try{
  if(authConfigured){
   // Before any future account-enabled release, retire the unauthenticated demo cache.
   const registrations=await navigator.serviceWorker.getRegistrations();
   for(const r of registrations)if(r.active?.scriptURL.endsWith('/demo-offline-sw.js'))await r.unregister();
   const keys=await caches.keys();
   await Promise.all(keys.filter(key=>key.startsWith('mamamwana-public-demo-')).map(key=>caches.delete(key)));
   return;
  }
  const reg=await navigator.serviceWorker.register('/demo-offline-sw.js',{scope:'/'});
  const ready=await navigator.serviceWorker.ready;
  const paths=[...document.querySelectorAll<HTMLScriptElement>('script[src]'),...document.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]')]
   .map(element=>element.getAttribute('src')||element.getAttribute('href')||'')
   .filter(value=>/^\/assets\/[A-Za-z0-9_-]+\.(js|css)$/.test(value));
  (navigator.serviceWorker.controller||ready.active||reg.active)?.postMessage({type:'PRECACHE_DEMO_ASSETS',paths});
 }catch{/* Optional enhancement: the online application remains available without a service worker. */}
}
