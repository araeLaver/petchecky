// 펫체키 Service Worker for Push Notifications

const CACHE_NAME = 'petchecky-v1';

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

// 서비스 워커 설치 시
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// 서비스 워커 활성화 시
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
