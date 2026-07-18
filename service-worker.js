'use strict';
const CACHE = 'sigma-life-os-v3.0-connected-providers';
const APP_SHELL = [
  './','./index.html','./app.html','./site.css','./style.css','./site.js','./app.js','./chart-fallback.js','./config.js','./online-config.js','./firebase-config.js','./google-cloud-config.js','./platform-config.js','./i18n.js','./lang-en.js','./lang-fr.js','./lang-de.js','./lang-es.js','./editions.js','./manifest.webmanifest',
  './modules/firebase-cloud.js','./modules/google-workspace.js','./modules/mail.js','./modules/tasks.js','./modules/projects.js','./modules/finance.js','./modules/health.js','./modules/journal.js','./modules/learning.js','./modules/planner.js','./modules/calendar-connect.js','./modules/context.js','./modules/social.js','./modules/coach.js','./modules/local-ai.js','./modules/dashboard.js','./assets/icon.svg','./assets/icon-192.png','./assets/icon-512.png','./assets/logo.svg'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).catch(()=>caches.match('./app.html')));
    return;
  }
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{
    if(!response.ok)return response;
    const copy=response.clone();
    event.waitUntil(caches.open(CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}));
    return response;
  })));
});
