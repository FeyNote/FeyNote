/// <reference lib="webworker" />

/* eslint-disable import/first */
/* eslint-disable no-restricted-globals */
/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare let self: ServiceWorkerGlobalScope;

import './serviceWorkerLib/util/sentryInit';
import { registerRoute } from 'workbox-routing';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { Queue } from 'workbox-background-sync';
import {
  getManifestDb,
  ObjectStoreName,
  SyncManager,
  SearchManager,
  SWMessageType,
  createSWDebugDump,
  initDebugStoreConsoleMonkeypatch,
} from '@feynote/ui-sw';
import { registerGetKnownUsersRoute } from './serviceWorkerLib/routes/user/registerGetKnownUsersRoute';
import { registerGetArtifactEdgesByIdRoute } from './serviceWorkerLib/routes/artifact/registerGetArtifactEdgesByIdRoute';
import { registerGetArtifactEdgesRoute } from './serviceWorkerLib/routes/artifact/registerGetArtifactEdgesRoute';
import { registerGetArtifactSnapshotByIdRoute } from './serviceWorkerLib/routes/artifact/registerGetArtifactSnapshotByIdRoute';
import { registerGetArtifactSnapshotsRoute } from './serviceWorkerLib/routes/artifact/registerGetArtifactSnapshotsRoute';
import { registerGetArtifactYBinByIdRoute } from './serviceWorkerLib/routes/artifact/registerGetArtifactYBinByIdRoute';
import { registerGetSafeArtifactIdRoute } from './serviceWorkerLib/routes/artifact/registerGetSafeArtifactIdRoute';
import { registerSearchArtifactBlocksRoute } from './serviceWorkerLib/routes/artifact/registerSearchArtifactBlocksRoute';
import { registerSearchArtifactsRoute } from './serviceWorkerLib/routes/artifact/registerSearchArtifactsRoute';
import { registerSearchArtifactTitlesRoute } from './serviceWorkerLib/routes/artifact/registerSearchArtifactTitlesRoute';
import { registerCreateFileRoute } from './serviceWorkerLib/routes/file/registerCreateFileRoute';
import { registerFileRedirectRoute } from './serviceWorkerLib/routes/file/registerFileRedirectRoute';
import { registerGetSafeFileIdRoute } from './serviceWorkerLib/routes/file/registerGetSafeFileIdRoute';
import { registerGetThreadsRoute } from './serviceWorkerLib/routes/ai/registerGetThreadsRoute';
import { registerGetThreadRoute } from './serviceWorkerLib/routes/ai/registerGetThreadRoute';

initDebugStoreConsoleMonkeypatch();

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

const staticAssets = [
  // Images
  'https://static.feynote.com/assets/parchment-background-20240925.jpg',
  'https://static.feynote.com/assets/parchment-background-grayscale-20240925.jpg',
  'https://static.feynote.com/assets/monster-border-20240925.png',
  'https://static.feynote.com/assets/note-border-20240925.png',
  'https://static.feynote.com/assets/red-triangle-20240925.png',
  'https://static.feynote.com/assets/fa-map-pin-solid-tldrawscale-20241219.svg',
  'https://static.feynote.com/assets/favicon-20240925.ico',
  'https://static.feynote.com/icons/generated/pwabuilder-20241220/android/android-launchericon-512-512.png',
  'https://cdn.tldraw.com/3.11.1/icons/icon/0_merged.svg',

  // Fonts
  'https://static.feynote.com/fonts/mr-eaves/mr-eaves-small-caps.woff2',
  'https://static.feynote.com/fonts/scaly-sans/scaly-sans.woff2',
  'https://static.feynote.com/fonts/scaly-sans/scaly-sans-caps.woff2',
  'https://static.feynote.com/fonts/book-insanity/book-insanity.woff2',
  'https://static.feynote.com/fonts/libre-baskerville/libre-baskerville-latin.woff2',
  'https://static.feynote.com/fonts/allison/allison-latin.woff2',
  'https://static.feynote.com/fonts/italianno/italianno-latin.woff2',
  'https://static.feynote.com/fonts/monsieur-la-doulaise/monsieur-la-doulaise-latin.woff2',
];
precacheAndRoute(staticAssets);

const searchManager = new SearchManager();
const syncManager = new SyncManager(searchManager);

const OFFLINE_BGSYNC_RETENTION_DAYS = 30;
const bgSyncQueue = new Queue('swWorkboxBgSyncQueue', {
  forceSyncFallback: true,
  maxRetentionTime: OFFLINE_BGSYNC_RETENTION_DAYS * 24 * 60,
  onSync: async ({ queue }) => {
    console.log('BGSyncQueue onSync', queue.size);
    const manifestDb = await getManifestDb();

    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        const response = await fetch(entry.request);
        if (response.status >= 200 && response.status < 300) {
          if (
            entry.metadata &&
            'type' in entry.metadata &&
            entry.metadata.type === 'trpc.file.createFile' &&
            'storedAsId' in entry.metadata
          ) {
            try {
              await manifestDb.delete(
                ObjectStoreName.PendingFiles,
                entry.metadata.storedAsId as string,
              );
            } catch (e) {
              console.error(
                'Failed to delete file from local db after successful upload',
                e,
              );
            }
          }
        } else {
          await queue.pushRequest(entry);

          throw new Error('Queue sync failed due to server error');
        }
      } catch (error) {
        await queue.pushRequest(entry);

        console.error('Replay failed for request', entry.request, error);
      }
    }
  },
});

addEventListener('message', async (event) => {
  if (!event.data?.type) {
    console.error('Unexpected message without data|type', event);
    return;
  }

  switch (event.data.type) {
    case SWMessageType.GetDebugDump: {
      const responsePort = event.ports[0];
      if (!responsePort) {
        console.error('No response port for getDebugDump');
        return;
      }

      const debugDump = await createSWDebugDump();
      responsePort.postMessage(JSON.parse(JSON.stringify(debugDump)));

      break;
    }
    default: {
      console.warn('Unhandled SW message', event);
    }
  }
});

const APP_SRC_CACHE_NAME = 'app-asset-cache';
const APP_SRC_PRECACHE_URLS = ['/', '/index.html', '/locales/en-us.json'];

self.skipWaiting();
clientsClaim();

self.addEventListener('install', () => {
  console.log('Service Worker installed');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');

  event.waitUntil(
    (async () => {
      await self.clients.claim();

      await caches
        .delete(APP_SRC_CACHE_NAME)
        .then(() =>
          caches
            .open(APP_SRC_CACHE_NAME)
            .then((cache) => cache.addAll(APP_SRC_PRECACHE_URLS)),
        );
    })(),
  );
});

self.addEventListener('sync', (event: any) => {
  if (event.tag === 'manifest') {
    event.waitUntil(syncManager.syncManifest());
  }
});

self.addEventListener('periodicSync', (event: any) => {
  if (event.tag === 'manifest') {
    event.waitUntil(syncManager.syncManifest());
  }
});

// Index should be cached networkFirst - this way, users will always get the newest application version
const MAX_OFFLINE_INDEX_AGE_DAYS = 60;
registerRoute(
  /(\/index\.html)|(\/$)/,
  new NetworkFirst({
    cacheName: APP_SRC_CACHE_NAME,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * MAX_OFFLINE_INDEX_AGE_DAYS,
      }),
    ],
  }),
);

// Language files should always come from network first since they change frequently
const MAX_LANGUAGE_AGE_DAYS = 60;
registerRoute(
  /\/locales\/.*/,
  new NetworkFirst({
    cacheName: APP_SRC_CACHE_NAME,
    plugins: [
      new ExpirationPlugin({
        maxAgeSeconds: 60 * 60 * 24 * MAX_LANGUAGE_AGE_DAYS,
      }),
    ],
  }),
);

registerGetKnownUsersRoute();

registerGetArtifactEdgesByIdRoute();
registerGetArtifactEdgesRoute();
registerGetArtifactSnapshotByIdRoute();
registerGetArtifactSnapshotsRoute();
registerGetArtifactYBinByIdRoute();
registerGetSafeArtifactIdRoute();
registerSearchArtifactsRoute(searchManager);
registerSearchArtifactBlocksRoute(searchManager);
registerSearchArtifactTitlesRoute(searchManager);

registerCreateFileRoute(bgSyncQueue);
registerFileRedirectRoute();
registerGetSafeFileIdRoute();

registerGetThreadsRoute();
registerGetThreadRoute();
