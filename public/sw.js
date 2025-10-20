// Simple service worker to prevent 404 errors
// This is a minimal service worker that does nothing
// but prevents the 404 error from appearing in console

self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// No fetch handler - let all requests pass through normally
