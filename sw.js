
const CACHE_NAME = 'eduplan-pro-v2';
const APP_ASSETS = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/manifest.json'
];

// Instalação: Cacheia os recursos básicos imediatamente
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Interceptação de Requisições: Estratégia Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  // Ignora requisições de extensões ou esquemas não suportados
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Se for uma resposta válida do nosso domínio ou de bibliotecas (esm.sh), guarda no cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Se falhar a rede e não tiver cache, tenta retornar a index.html (fallback PWA)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });

      // Retorna o cache imediatamente se existir, senão espera a rede
      return cachedResponse || fetchPromise;
    })
  );
});
