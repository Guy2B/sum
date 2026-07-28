'use strict';
// V4.5 deliberately uses network-first delivery to prevent stale UI bundles on GitHub Pages.
// Canonical offline shell module manifest used by validation and future precaching.
const ACTIVE_MODULES = [
  'modules/local-ai.js',
  'modules/social.js',
  'modules/context.js',
  'modules/ai-settings.js',
  'modules/intelligence-v17.js',
  'modules/experience-v17.js',
  'modules/native-health-bridge.js',
  'modules/calendar-connect.js'
];
const CACHE = 'sigma-life-os-v8000';
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

