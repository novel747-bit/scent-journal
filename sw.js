const CACHE_NAME = 'scentjournal-cache-v4';

// 定義需要快取的核心檔案
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web'
];

// 安裝階段：將核心檔案加入快取
self.addEventListener('install', event => {
  self.skipWaiting(); // 強制立刻啟用新的 Service Worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 啟用階段：清除舊版本的快取
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('清除舊快取:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 攔截請求：採用 Cache First, fall back to Network 策略
self.addEventListener('fetch', event => {
  // 針對 API 請求不進行快取
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // 從快取返回
        }
        // 否則透過網路抓取
        return fetch(event.request).then(
          function(networkResponse) {
            // 不快取無效的請求
            if(!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            return networkResponse;
          }
        );
      })
  );
});
