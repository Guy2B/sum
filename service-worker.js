'use strict';
const CACHE = 'sigma-life-os-v1.7.0-admin-beta';
const APP_SHELL = [
  './', './index.html', './app.html', './site.css', './style.css', './site.js', './app.js', './chart-fallback.js', './config.js', './i18n.js',
  './lang-en.js', './lang-fr.js', './lang-de.js', './lang-es.js', './editions.js', './manifest.webmanifest',
  './modules/tasks.js', './modules/native-health-bridge.js', './modules/projects.js', './modules/finance.js', './modules/health.js', './modules/journal.js', './modules/learning.js', './modules/planner.js', './modules/calendar-connect.js', './modules/context.js', './modules/mail.js', './modules/social.js', './modules/coach.js', './modules/local-ai.js', './modules/ai-settings.js', './modules/coach-v121.js', './modules/dashboard.js', './modules/intelligence-v17.js', './modules/experience-v17.js',
  './assets/icon.svg', './assets/icon-192.png', './assets/icon-512.png', './assets/logo.svg',
  './legal/privacy.html', './legal/terms.html', './legal/support.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.hostname.includes('cdn.jsdelivr.net')) {
    event.respondWith(caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      const response = await fetch(event.request);
      if (response.ok) cache.put(event.request, response.clone());
      return response;
    }));
    return;
  }
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy));
      return response;
    }).catch(() => caches.match(event.request).then((match) => match || caches.match('./app.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
    if (url.origin === location.origin && response.ok) caches.open(CACHE).then((cache) => cache.put(event.request, response.clone()));
    return response;
  })));
});
