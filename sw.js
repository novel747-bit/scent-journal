const CACHE_NAME = 'scent-journal-v3';

// 安裝 Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 啟用並清除舊快取
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 網路優先策略：線上時抓取最新內容，離線時自動切換為快取備援
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
