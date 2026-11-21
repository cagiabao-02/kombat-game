const CACHE_NAME = 'kombat-pwa-v1';

const PRECACHE_URLS = [
  '/',
  '/manifest.webmanifest',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
  '/games/sudoku',
  '/games/chess',
  '/games/caro',
  '/games/xiangqi',
  '/games/go',
  '/games/snake',
  '/games/game2048',
  '/games/minesweeper',
  '/games/brick-breaker',
  '/games/t-rex-runner',
  '/games/flappy-bird',
  '/games/block-blast',
  '/games/tetris',
  '/games/othello',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Không cache API Supabase / Auth / Realtime hoặc ngoài HTTP(S)
  if (
    !url.protocol.startsWith('http') ||
    url.hostname.includes('supabase.co') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  // 1. Điều hướng trang (HTML): Network-First, mất mạng thì lấy từ Cache
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return caches.match('/');
        })
    );
    return;
  }

  // 2. Tài nguyên tĩnh (_next/static, icon, fonts): Cache-First + cập nhật nền
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname.startsWith('/icon') ||
      url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.svg') ||
      url.pathname.endsWith('.webmanifest'))
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
  }
});
