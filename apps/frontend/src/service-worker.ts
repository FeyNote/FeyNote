/// <reference lib="webworker" />

/* eslint-disable import/first */
/* eslint-disable no-restricted-globals */
/* eslint-disable @nx/enforce-module-boundaries */
/* eslint-disable @typescript-eslint/no-explicit-any */

declare let self: ServiceWorkerGlobalScope;

import * as Sentry from '@sentry/browser';

let environment = import.meta.env.MODE || import.meta.env.VITE_ENVIRONMENT;
if (environment !== 'development') {
  const hostname = self.location.hostname;

  if (environment === 'production' && hostname.includes('.beta.')) {
    // We don't do separate builds for beta/production, so hostname check is the best
    // approach
    environment = 'beta';
  }

  Sentry.init({
    release: import.meta.env.VITE_APP_VERSION,
    environment,
    dsn: 'https://c33be4806db6ac96de06c5de2f8ebc85@o4508428193955840.ingest.us.sentry.io/4508428202606592',
    transport: Sentry.makeBrowserOfflineTransport(Sentry.makeFetchTransport),

    tracesSampleRate: 1,

    initialScope: {
      extra: {
        source: 'serviceworker',
      },
    },
  });
}

import { registerRoute } from 'workbox-routing';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { RouteHandlerCallbackOptions } from 'workbox-core';
import { SearchManager } from '../../../libs/ui/src/utils/SearchManager';
import { SyncManager } from '../../../libs/ui/src/utils/localDb/SyncManager';
import {
  getKvStoreEntry,
  getManifestDb,
  KVStoreKeys,
  ObjectStoreName,
} from '../../../libs/ui/src/utils/localDb';
import { FileStreamDecoder } from '../../../libs/shared-utils/src/lib/parsers/stream/file/FileStreamDecoder';
import { readableStreamToUint8Array } from '../../../libs/shared-utils/src/lib/parsers/readableStreamToUint8Array';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { Queue } from 'workbox-background-sync';
import { Doc, encodeStateAsUpdate } from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { customTrpcTransformer } from '../../../libs/shared-utils/src/lib/customTrpcTransformer';
import type { trpc } from '@feynote/ui';
import type { Resolver } from '@trpc/client';
import { getEdgeId, type Edge } from '@feynote/shared-utils';

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

const getTrpcInputForEvent = <T extends Resolver<any>>(
  event: RouteHandlerCallbackOptions,
) => {
  const encodedInput = event.url.searchParams.get('input');
  if (!encodedInput) return;

  const input = customTrpcTransformer.deserialize(JSON.parse(encodedInput));

  return input as Parameters<T>[0];
};

const encodeCacheResultForTrpc = <T extends Resolver<any>>(
  result: Awaited<ReturnType<T>>,
) => {
  return new Response(
    JSON.stringify({
      result: {
        data: customTrpcTransformer.serialize(result),
      },
    }),
    {
      headers: {
        swcache: 'true',
        'content-type': 'application/json',
      },
    },
  );
};

async function tryStoreInCacheWithQuotaPurge(
  cache: Cache,
  request: Request,
  response: Response,
  maxCacheEntries = 50,
) {
  try {
    await limitCacheToMaxEntries(cache, maxCacheEntries - 1);
    await cache.put(request, response.clone());
  } catch (err: any) {
    if (
      err instanceof DOMException &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      await purgeOldestEntries(cache);
    }
  }
}

async function purgeOldestEntries(cache: Cache, maxToDelete = 5) {
  const requests = await cache.keys();
  for (let i = 0; i < Math.min(maxToDelete, requests.length); i++) {
    await cache.delete(requests[i]);
  }
}

async function limitCacheToMaxEntries(cache: Cache, maxEntries = 50) {
  const requests = await cache.keys();
  if (requests.length > maxEntries) {
    await purgeOldestEntries(cache, requests.length - maxEntries);
  }
}

const updateListCache = async (
  objectStoreName: ObjectStoreName,
  trpcResponse: Response,
) => {
  const json = await trpcResponse.json();
  const deserialized = customTrpcTransformer.deserialize(json.result.data) as {
    id: string;
    updatedAt: string;
  }[];
  const manifestDb = await getManifestDb();

  const tx = manifestDb.transaction(objectStoreName, 'readwrite');
  const store = tx.objectStore(objectStoreName);
  await store.clear();
  for (const item of deserialized) {
    await manifestDb.put(objectStoreName, item);
  }
  await tx.done;
};

const cacheListResponse = async (
  objectStoreName: ObjectStoreName,
  event: RouteHandlerCallbackOptions,
) => {
  try {
    const response = await fetch(event.request);

    if (response.status >= 200 && response.status < 300) {
      updateListCache(objectStoreName, response.clone());
    }

    return response;
  } catch (e) {
    console.log(`Request failed`, e);

    // TODO: check response for statuscode
    // since we don't want to eat unauthorized errors

    const manifestDb = await getManifestDb();
    const cachedItems = await manifestDb.getAll(objectStoreName);

    return encodeCacheResultForTrpc(cachedItems);
  }
};

const APP_SRC_CACHE_NAME = 'app-asset-cache';
const APP_SRC_PRECACHE_URLS = ['/', '/index.html', '/locales/en-us.json'];
self.addEventListener('install', () => {
  console.log('Service Worker installed');

  self.skipWaiting();
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

// Artifact assets are immutable. Should be cached indefinitely, but we need to limit them so
// we don't "anger" the browser by caching too much
const ARTIFACT_ASSET_CACHE_NAME = 'artifact-asset-cache';
const ARTIFACT_ASSET_CACHE_MAX_ENTRIES = 100;
registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/file\/(.*?)\/redirect/,
  async (event) => {
    const fileId = event.url.pathname.match(/\/file\/(.*?)\/redirect/)?.[1];
    if (!fileId) throw new Error('No fileId found in URL');

    const manifestDb = await getManifestDb();
    const pendingFile = await manifestDb.get(
      ObjectStoreName.PendingFiles,
      fileId,
    );

    if (pendingFile) {
      return new Response(
        pendingFile.fileContentsUint8 as Buffer<ArrayBuffer>,
        {
          headers: {
            'Content-Type': pendingFile.mimetype,
            'Content-Disposition': `attachment; filename="${pendingFile.fileName}"`,
            swcache: 'true',
            'Accept-Ranges': 'bytes',
            'Content-Length': pendingFile.fileSize.toString(),
          },
        },
      );
    }

    // Try to see if we have anything in the cache
    const cache = await caches.open(ARTIFACT_ASSET_CACHE_NAME);
    const cachedResponse = await cache.match(event.request);
    if (cachedResponse) return cachedResponse;

    // Fall back to server
    const response = await fetch(event.request);
    if (
      response.status === 0 ||
      response.status === 200 ||
      response.status === 302
    ) {
      await tryStoreInCacheWithQuotaPurge(
        cache,
        event.request,
        response,
        ARTIFACT_ASSET_CACHE_MAX_ENTRIES,
      );
    }

    return response;
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/file\.createFile/,
  async (event) => {
    const clonedRequest = event.request.clone();
    try {
      const response = await fetch(event.request);

      return response;
    } catch (_e) {
      // We need a second instance of the cloned request so we can store it in the bgSyncQueue
      const clonedRequest2 = clonedRequest.clone();
      const blob = await clonedRequest.blob();
      const input = await new FileStreamDecoder(blob.stream()).decode();
      const fileContentsUint8 = await readableStreamToUint8Array(
        input.fileContents,
      );

      await bgSyncQueue.pushRequest({
        request: clonedRequest2,
        metadata: {
          type: 'trpc.file.createFile',
          storedAsId: input.id,
        },
      });

      const manifestDb = await getManifestDb();
      await manifestDb.put(ObjectStoreName.PendingFiles, {
        ...input,
        fileContents: null,
        fileContentsUint8,
      });

      return encodeCacheResultForTrpc<typeof trpc.file.createFile.mutate>({
        id: input.id,
        name: input.fileName,
        mimetype: input.mimetype,
        storageKey: 'UPLOADED_OFFLINE',
      });
    }
  },
  'POST',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/file\.getSafeFileId/,
  async (event) => {
    try {
      const response = await fetch(event.request);

      return response;
    } catch (_e) {
      // When offline we rely on the very low chance of a uuid collision
      const candidateId = crypto.randomUUID();
      return encodeCacheResultForTrpc<typeof trpc.file.getSafeFileId.query>({
        id: candidateId,
      });
    }
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactYBinById/,
  async (event) => {
    // Cache first
    const input =
      getTrpcInputForEvent<typeof trpc.artifact.getArtifactYBinById.query>(
        event,
      );
    if (!input || !input.id)
      throw new Error('No id provided in procedure input');

    const docName = `artifact:${input.id}`;
    const manifestDb = await getManifestDb();
    const manifestArtifactVersion = await manifestDb.get(
      ObjectStoreName.ArtifactVersions,
      input.id,
    );
    if (!manifestArtifactVersion) {
      const response = await fetch(event.request);

      return response;
    }

    const idbPersistence = new IndexeddbPersistence(docName, new Doc());
    await idbPersistence.whenSynced;

    const yBin = encodeStateAsUpdate(idbPersistence.doc);

    await idbPersistence.destroy();

    return encodeCacheResultForTrpc<
      typeof trpc.artifact.getArtifactYBinById.query
    >({
      yBin,
    });
  },
  'GET',
);

/**
 * Converts targetArtifactBlockId from string -> null in the case of ''
 * This must be done since it's part of the index and indexeddb requires index values be non-null
 */
function idbEdgeToEdge(edge: Edge): Edge {
  return {
    id: getEdgeId(edge),
    artifactTitle: edge.artifactTitle,
    artifactId: edge.artifactId,
    artifactBlockId: edge.artifactBlockId,
    artifactDeleted: edge.artifactDeleted,
    targetArtifactId: edge.targetArtifactId,
    targetArtifactBlockId: edge.targetArtifactBlockId || null,
    targetArtifactDate: edge.targetArtifactDate,
    targetArtifactTitle: edge.targetArtifactTitle,
    targetArtifactDeleted: edge.targetArtifactDeleted,
    referenceText: edge.referenceText,
  };
}

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactEdgesById/,
  async (event) => {
    // Cache first
    const input =
      getTrpcInputForEvent<typeof trpc.artifact.getArtifactEdgesById.query>(
        event,
      );
    if (!input || !input.id)
      throw new Error('No id provided in procedure input');

    const manifestDb = await getManifestDb();

    const localArtifactVersion = await manifestDb.get(
      ObjectStoreName.ArtifactVersions,
      input.id,
    );
    if (!localArtifactVersion) {
      const response = await fetch(event.request);

      return response;
    }

    const outgoingEdges = await manifestDb.getAllFromIndex(
      ObjectStoreName.Edges,
      'artifactId',
      input.id,
    );
    const incomingEdges = await manifestDb.getAllFromIndex(
      ObjectStoreName.Edges,
      'targetArtifactId',
      input.id,
    );

    return encodeCacheResultForTrpc<
      typeof trpc.artifact.getArtifactEdgesById.query
    >({
      outgoingEdges: outgoingEdges.map(idbEdgeToEdge),
      incomingEdges: incomingEdges.map(idbEdgeToEdge),
    });
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactEdges/,
  async () => {
    const manifestDb = await getManifestDb();

    const edges = await manifestDb.getAll(ObjectStoreName.Edges);

    const result = edges.map(idbEdgeToEdge);

    return encodeCacheResultForTrpc<
      typeof trpc.artifact.getArtifactEdges.query
    >(result);
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactSnapshotById/,
  async (event) => {
    // Cache first
    const input =
      getTrpcInputForEvent<typeof trpc.artifact.getArtifactSnapshotById.query>(
        event,
      );
    if (!input || !input.id)
      throw new Error('No id provided in procedure input');

    const manifestDb = await getManifestDb();

    const localArtifactSnapshot = await manifestDb.get(
      ObjectStoreName.ArtifactSnapshots,
      input.id,
    );
    if (!localArtifactSnapshot) {
      const response = await fetch(event.request);

      return response;
    }

    return encodeCacheResultForTrpc<
      typeof trpc.artifact.getArtifactSnapshotById.query
    >(localArtifactSnapshot);
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactSnapshots/,
  async (event) => {
    const manifestDb = await getManifestDb();

    const VALID_DAYS = 30;
    const syncValidWindow = new Date();
    syncValidWindow.setDate(syncValidWindow.getDate() - VALID_DAYS);
    const lastSyncedAt = await getKvStoreEntry(KVStoreKeys.LastSyncedAt);

    if (!lastSyncedAt || lastSyncedAt < syncValidWindow) {
      const response = await fetch(event.request);
      return response;
    }

    const snapshots = await manifestDb.getAll(
      ObjectStoreName.ArtifactSnapshots,
    );

    return encodeCacheResultForTrpc<
      typeof trpc.artifact.getArtifactSnapshots.query
    >(snapshots);
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.searchArtifacts/,
  async (event) => {
    try {
      const response = await fetch(event.request);

      return response;
    } catch (_e) {
      const input =
        getTrpcInputForEvent<typeof trpc.artifact.searchArtifacts.query>(event);
      if (!input || !input.query) throw new Error('No query provided');

      const searchResults = searchManager.search(input.query);
      const artifactIds = new Set(
        searchResults.map((searchResult) => searchResult.artifactId),
      );

      const manifestDb = await getManifestDb();
      const results = [];
      for (const artifactId of artifactIds) {
        const artifact = await manifestDb.get(
          ObjectStoreName.Artifacts,
          artifactId,
        );
        if (artifact)
          results.push({
            artifact,
            // We have no highlighting support while offline at this time.
            // It would require loading each search result's yBin from indexeddb,
            // applying it to a yDoc, converting it to tiptap json, getting all text,
            // and then correlating the match text from minisearch
            // The above is too heavy a lift.
            highlight: undefined,
          });
      }

      const limitedResults = results.slice(0, input.limit || 50);
      return encodeCacheResultForTrpc<
        typeof trpc.artifact.searchArtifacts.query
      >(limitedResults);
    }
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.searchArtifactTitles/,
  async (event) => {
    try {
      const response = await fetch(event.request);

      return response;
    } catch (_e) {
      const input =
        getTrpcInputForEvent<typeof trpc.artifact.searchArtifactTitles.query>(
          event,
        );
      if (!input || !input.query) throw new Error('No query provided');

      const searchResults = searchManager.search(input.query);
      const artifactIds = new Set(
        searchResults
          .filter((searchResult) => !searchResult.blockId)
          .map((searchResult) => searchResult.artifactId),
      );

      const manifestDb = await getManifestDb();
      const results = [];
      for (const artifactId of artifactIds) {
        const artifact = await manifestDb.get(
          ObjectStoreName.Artifacts,
          artifactId,
        );
        if (artifact)
          results.push({
            artifact,
            highlight: undefined,
          });
      }

      const limitedResults = results.slice(0, input.limit || 50);
      return encodeCacheResultForTrpc<
        typeof trpc.artifact.searchArtifactTitles.query
      >(limitedResults);
    }
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.searchArtifactBlocks/,
  async (event) => {
    try {
      const response = await fetch(event.request);

      return response;
    } catch (_e) {
      const input =
        getTrpcInputForEvent<typeof trpc.artifact.searchArtifactBlocks.query>(
          event,
        );
      if (!input || !input.query) throw new Error('No query provided');

      const searchResults = searchManager.search(input.query);

      const manifestDb = await getManifestDb();
      const results = [];
      for (const searchResult of searchResults) {
        if (!searchResult.blockId) continue;

        const artifact = await manifestDb.get(
          ObjectStoreName.Artifacts,
          searchResult.artifactId,
        );
        if (artifact)
          results.push({
            artifact,
            blockId: searchResult.blockId,
            blockText: searchResult.previewText,
            // This isn't exact, since the search engine would normally return marked results, but we don't want to calculate that ourselves manually at the moment. Additionally, the previewText isn't that long to begin with, so not much to work with here hence the shortcut.
            highlight: searchResult.previewText.substring(0, 100),
          });
      }

      const limitedResults = results.slice(0, input.limit || 50);
      return encodeCacheResultForTrpc<
        typeof trpc.artifact.searchArtifactBlocks.query
      >(limitedResults);
    }
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getSafeArtifactId/,
  async (event) => {
    try {
      const response = await fetch(event.request);

      return response;
    } catch (_e) {
      const manifestDb = await getManifestDb();

      while (true) {
        // We can at least check local artifacts which isn't globally guaranteed but oh well
        const candidateId = crypto.randomUUID();
        const artifact = await manifestDb.get(
          ObjectStoreName.Artifacts,
          candidateId,
        );
        if (!artifact) {
          return encodeCacheResultForTrpc<
            typeof trpc.artifact.getSafeArtifactId.query
          >({ id: candidateId });
        }
      }
    }
  },
  'GET',
);

registerRoute(
  /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/user\.getKnownUsers/,
  async (event) => {
    return cacheListResponse(ObjectStoreName.KnownUsers, event);
  },
  'GET',
);
