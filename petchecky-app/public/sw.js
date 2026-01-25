// 펫체키 Service Worker v3 - Enhanced PWA Support
// Caching strategies, Background Sync, Share Target, Push Notifications

const CACHE_VERSION = 'v3';
const STATIC_CACHE = `petchecky-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `petchecky-dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `petchecky-images-${CACHE_VERSION}`;
const API_CACHE = `petchecky-api-${CACHE_VERSION}`;

const OFFLINE_URL = '/offline';
const OFFLINE_FALLBACK_URL = '/';

// Static assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/offline',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Cache limits
const CACHE_LIMITS = {
  dynamic: 50,
  images: 100,
  api: 30,
};

// Cacheable API routes (read-only endpoints)
const CACHEABLE_API_ROUTES = [
  '/api/community/posts',
];

// ======================
// Installation
// ======================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker v3');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// ======================
// Activation
// ======================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker v3');

  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, IMAGE_CACHE, API_CACHE];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Enable navigation preload if supported
        if (self.registration.navigationPreload) {
          return self.registration.navigationPreload.enable();
        }
      })
      .then(() => clients.claim())
  );
});

// ======================
// Fetch Handling
// ======================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Skip non-GET requests (except Share Target)
  if (request.method !== 'GET') {
    if (request.method === 'POST' && url.pathname === '/share') {
      event.respondWith(handleShareTarget(request));
    }
    return;
  }

  // Route to appropriate strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(event));
  } else if (isImageRequest(request)) {
    event.respondWith(handleImageRequest(event));
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(event));
  } else {
    event.respondWith(handleStaticRequest(event));
  }
});

// ======================
// Caching Strategies
// ======================

// Network First with Cache Fallback (for navigation)
async function handleNavigationRequest(event) {
  const { request } = event;

  try {
    // Try navigation preload first
    const preloadResponse = await event.preloadResponse;
    if (preloadResponse) {
      return preloadResponse;
    }

    // Network request
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, serving cached or offline page');

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlinePage = await caches.match(OFFLINE_URL);
    if (offlinePage) {
      return offlinePage;
    }

    // Ultimate fallback to home
    return caches.match(OFFLINE_FALLBACK_URL);
  }
}

// Stale While Revalidate (for static assets)
async function handleStaticRequest(event) {
  const { request } = event;

  const cachedResponse = await caches.match(request);

  const networkFetch = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cachedResponse);

  return cachedResponse || networkFetch;
}

// Cache First with Network Fallback (for images)
async function handleImageRequest(event) {
  const { request } = event;

  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
      await trimCache(IMAGE_CACHE, CACHE_LIMITS.images);
    }

    return networkResponse;
  } catch (error) {
    // Return a placeholder image for failed image requests
    return new Response('', { status: 404 });
  }
}

// Network First with Timeout (for API)
async function handleApiRequest(event) {
  const { request } = event;
  const url = new URL(request.url);

  // Check if this API route is cacheable
  const isCacheable = CACHEABLE_API_ROUTES.some(route =>
    url.pathname.startsWith(route)
  );

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const networkResponse = await fetch(request, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (networkResponse.ok && isCacheable) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, networkResponse.clone());
      await trimCache(API_CACHE, CACHE_LIMITS.api);
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed:', request.url);

    // Try cache for cacheable routes
    if (isCacheable) {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }

    // Return offline error response
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: '오프라인 상태입니다. 인터넷 연결을 확인해주세요.',
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ======================
// Share Target Handler
// ======================
async function handleShareTarget(request) {
  console.log('[SW] Handling share target');

  try {
    const formData = await request.formData();
    const title = formData.get('title') || '';
    const text = formData.get('text') || '';
    const url = formData.get('url') || '';
    const files = formData.getAll('images');

    // Store shared data for the client to pick up
    const shareData = {
      title,
      text,
      url,
      hasFiles: files.length > 0,
      timestamp: Date.now(),
    };

    // Send message to all clients
    const allClients = await clients.matchAll({ type: 'window' });
    for (const client of allClients) {
      client.postMessage({
        type: 'SHARE_TARGET_DATA',
        data: shareData,
      });
    }

    // Redirect to chat with shared content
    const redirectUrl = new URL('/', self.location.origin);
    redirectUrl.searchParams.set('action', 'chat');
    if (text) redirectUrl.searchParams.set('shared_text', text);
    if (url) redirectUrl.searchParams.set('shared_url', url);

    return Response.redirect(redirectUrl.href, 303);
  } catch (error) {
    console.error('[SW] Share target error:', error);
    return Response.redirect('/', 303);
  }
}

// ======================
// Background Sync
// ======================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  switch (event.tag) {
    case 'petchecky-sync':
      event.waitUntil(syncPendingData());
      break;
    case 'petchecky-sync-messages':
      event.waitUntil(syncPendingMessages());
      break;
    default:
      console.log('[SW] Unknown sync tag:', event.tag);
  }
});

async function syncPendingData() {
  console.log('[SW] Syncing pending data');

  // Notify clients about sync
  const allClients = await clients.matchAll();
  for (const client of allClients) {
    client.postMessage({ type: 'SYNC_STARTED' });
  }

  // Sync logic would go here (e.g., retry failed API calls)

  for (const client of allClients) {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  }
}

async function syncPendingMessages() {
  console.log('[SW] Syncing pending messages');

  const allClients = await clients.matchAll();
  for (const client of allClients) {
    client.postMessage({ type: 'SYNC_MESSAGES' });
  }
}

// Periodic Background Sync (if supported)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync:', event.tag);

  if (event.tag === 'petchecky-daily-update') {
    event.waitUntil(performPeriodicSync());
  }
});

async function performPeriodicSync() {
  console.log('[SW] Performing periodic sync');

  // Refresh cached API data
  try {
    const cache = await caches.open(API_CACHE);
    const requests = await cache.keys();

    for (const request of requests) {
      try {
        const response = await fetch(request);
        if (response.ok) {
          await cache.put(request, response);
        }
      } catch (error) {
        console.log('[SW] Failed to refresh:', request.url);
      }
    }
  } catch (error) {
    console.error('[SW] Periodic sync error:', error);
  }
}

// ======================
// Push Notifications
// ======================
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  if (!event.data) return;

  try {
    const data = event.data.json();

    const options = {
      body: data.body || '펫체키에서 새로운 알림이 도착했습니다.',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      image: data.image,
      vibrate: [100, 50, 100, 50, 100],
      data: {
        url: data.url || '/',
        actionUrl: data.actionUrl,
        dateOfArrival: Date.now(),
        primaryKey: data.id || Date.now(),
      },
      actions: data.actions || [
        { action: 'open', title: '확인하기', icon: '/icons/action-open.png' },
        { action: 'dismiss', title: '닫기', icon: '/icons/action-close.png' },
      ],
      tag: data.tag || `petchecky-${Date.now()}`,
      renotify: data.renotify !== false,
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
    };

    event.waitUntil(
      self.registration.showNotification(data.title || '펫체키', options)
    );
  } catch (error) {
    console.error('[SW] Push notification error:', error);

    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('펫체키', {
        body: event.data.text() || '새로운 알림',
        icon: '/icons/icon-192x192.png',
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.actionUrl ||
                    event.notification.data?.url ||
                    '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');

  // Track notification dismissal (analytics)
  const data = event.notification.data;
  if (data?.primaryKey) {
    // Could send analytics event here
  }
});

// ======================
// Message Handler
// ======================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data?.type);

  const { type, data } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'CACHE_URLS':
      event.waitUntil(cacheUrls(data.urls));
      break;

    case 'CLEAR_CACHE':
      event.waitUntil(clearAllCaches());
      break;

    case 'GET_CACHE_STATUS':
      event.waitUntil(sendCacheStatus(event.source));
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

async function cacheUrls(urls) {
  if (!urls || !urls.length) return;

  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.addAll(urls);
  await trimCache(DYNAMIC_CACHE, CACHE_LIMITS.dynamic);
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((name) => caches.delete(name))
  );
  console.log('[SW] All caches cleared');
}

async function sendCacheStatus(client) {
  const cacheNames = await caches.keys();
  const status = {};

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    status[name] = keys.length;
  }

  client.postMessage({
    type: 'CACHE_STATUS',
    data: status,
  });
}

// ======================
// Utility Functions
// ======================

function isImageRequest(request) {
  const url = new URL(request.url);
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.avif'];
  return imageExtensions.some(ext => url.pathname.toLowerCase().endsWith(ext));
}

async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    const keysToDelete = keys.slice(0, keys.length - maxItems);
    await Promise.all(
      keysToDelete.map((key) => cache.delete(key))
    );
    console.log(`[SW] Trimmed ${keysToDelete.length} items from ${cacheName}`);
  }
}

// Log service worker version
console.log('[SW] Service Worker v3 loaded');
