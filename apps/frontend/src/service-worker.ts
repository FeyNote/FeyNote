/* eslint-disable no-restricted-globals */

importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js',
);
const { precaching, routing, strategies, expiration, core } = (self as any)
  .workbox;
const { precacheAndRoute, cleanupOutdatedCaches } = precaching;
const { registerRoute } = routing;
const { NetworkFirst, CacheFirst } = strategies;
const { ExpirationPlugin } = expiration;
const { clientsClaim } = core;

cleanupOutdatedCaches();
// @ts-expect-error We cannot cast here since the literal "self.__WB_MANIFEST" is regexed by vite PWA
precacheAndRoute(self.__WB_MANIFEST);

(self as any).skipWaiting();
clientsClaim();

self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', () => {
  console.log('Service Worker activated');
});
