self.addEventListener('install', e=>{
  e.waitUntil(caches.open('xenobio-v1').then(c=> c.addAll([
    './','./index.html','./assets/css/styles.css','./assets/js/app.js','./assets/js/audio.js','./assets/img/icon-64.png','./assets/img/icon-192.png','./assets/img/icon-512.png','./manifest.json'
  ])));
});
self.addEventListener('fetch', e=>{ e.respondWith(caches.match(e.request).then(r=> r || fetch(e.request))); });
