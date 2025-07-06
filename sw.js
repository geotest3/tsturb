// Service Worker para funcionalidade offline
const CACHE_NAME = 'regfundiaria-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/assets/css/style.css',
    '/assets/js/app.js',
    '/assets/js/auth.js',
    '/assets/js/dashboard.js',
    '/assets/js/imoveis.js',
    '/assets/js/proprietarios.js',
    '/assets/js/processos.js',
    '/assets/js/importar.js',
    '/assets/js/memorial.js',
    '/assets/js/mapa.js',
    '/assets/js/relatorios.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://code.jquery.com/jquery-3.7.1.min.js',
    'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});