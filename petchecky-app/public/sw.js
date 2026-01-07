// 펫체키 Service Worker for Offline Support and Push Notifications

const CACHE_NAME = 'petchecky-v2';
const OFFLINE_URL = '/';

// Assets to cache immediately for offline use
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
];

// 서비스 워커 설치 시 - 기본 자산 캐싱
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('PetChecky SW: Caching core assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// 서비스 워커 활성화 시 - 이전 캐시 정리
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('PetChecky SW: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => clients.claim())
  );
});

// 네트워크 요청 가로채기 - 캐시 우선 전략
self.addEventListener('fetch', (event) => {
  // GET 요청만 캐시
  if (event.request.method !== 'GET') return;

  // API 요청은 항상 네트워크 우선
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return new Response(
            JSON.stringify({ error: 'offline', message: '오프라인 상태입니다' }),
            { status: 503, headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 정적 자산은 캐시 우선, 네트워크 폴백
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // 백그라운드에서 캐시 업데이트
          event.waitUntil(
            fetch(event.request)
              .then((response) => {
                if (response && response.status === 200) {
                  const responseClone = response.clone();
                  caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                  });
                }
              })
              .catch(() => {})
          );
          return cachedResponse;
        }

        // 캐시에 없으면 네트워크 요청
        return fetch(event.request)
          .then((response) => {
            // 유효한 응답만 캐시
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });

            return response;
          })
          .catch(() => {
            // 네비게이션 요청은 메인 페이지로 폴백
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// 백그라운드 동기화
self.addEventListener('sync', (event) => {
  if (event.tag === 'petchecky-sync') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  console.log('PetChecky SW: Background sync triggered');
  // 클라이언트에 메시지 전송
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}

// 푸시 알림 수신 시
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const options = {
      body: data.body || '펫체키에서 새로운 알림이 도착했습니다.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/',
        dateOfArrival: Date.now(),
      },
      actions: data.actions || [
        { action: 'open', title: '열기' },
        { action: 'close', title: '닫기' },
      ],
      tag: data.tag || 'petchecky-notification',
      renotify: true,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '펫체키', options)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
});

// 알림 클릭 시
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열린 창이 있으면 포커스
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 메시지 수신 (클라이언트와 통신)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});
