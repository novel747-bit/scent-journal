const CACHE_NAME = 'scentjournal-cache-v5'; // 已經升級到 v5

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/@phosphor-icons/web'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

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

self.addEventListener('fetch', event => {
  // 絕對不快取對 Gemini API 的請求，直接讓它走網路
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return; // 放行，不介入
  }
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // 有快取就回傳快取
      }
      
      // 沒快取就發起網路請求
      return fetch(event.request).then(networkResponse => {
        // 確認拿到的是正常的 Response 物件，否則丟出錯誤
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        
        // 可選：如果你想要動態快取新圖片，可以寫在這裡
        // 但目前我們只要確保能正常回傳即可
        return networkResponse;
      }).catch(err => {
        // 當使用者離線且又沒有快取時，回傳一個自訂的錯誤 Response 以避免 TypeError
        console.error('Fetch failed; returning offline response instead.', err);
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      });
    })
  );
});
