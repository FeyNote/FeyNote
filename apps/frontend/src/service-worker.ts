/* eslint-disable no-restricted-globals */

import { registerRoute } from 'workbox-routing';
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim, RouteHandlerCallbackOptions } from 'workbox-core';
import { NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { superjson } from './utils/trpc';
import { SearchManager } from './utils/SearchManager';
import { getManifestDb, ObjectStoreName } from './utils/localDb';
import { SyncManager } from './utils/SyncManager';

cleanupOutdatedCaches();
// @ts-expect-error We cannot cast here since the literal "self.__WB_MANIFEST" is regexed by vite PWA
precacheAndRoute(self.__WB_MANIFEST);

(self as any).skipWaiting();
clientsClaim();

const searchManagerP = getManifestDb().then(
  (manifestDb) => new SearchManager(manifestDb),
);
const syncManagerP = Promise.all([getManifestDb(), searchManagerP]).then(
  ([manifestDb, searchManager]) => new SyncManager(manifestDb, searchManager),
);

const getTrpcInputForEvent = <T>(event: RouteHandlerCallbackOptions) => {
  const encodedInput = event.url.searchParams.get('input');
  if (!encodedInput) return;

  const input = superjson.parse<T>(encodedInput);

  return input;
};

const encodeCacheResultForTrpc = (result: any) => {
  return new Response(
    JSON.stringify({
      result: {
        data: superjson.serialize(result),
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

const updateListCache = async (
  objectStoreName: ObjectStoreName,
  trpcResponse: Response,
) => {
  const json = await trpcResponse.json();
  const deserialized = superjson.deserialize<
    { id: string; updatedAt: string }[]
  >(json.result.data);
  const manifestDb = await getManifestDb();

  const tx = manifestDb.transaction(objectStoreName, 'readwrite');
  const store = tx.objectStore(objectStoreName);
  await store.clear();
  for (const item of deserialized) {
    await manifestDb.add(objectStoreName, item);
  }
  await tx.done;
};

const updateSingleCache = async (
  objectStoreName: ObjectStoreName,
  trpcResponse: Response,
) => {
  const json = await trpcResponse.json();
  const deserialized = superjson.deserialize<{ id: string }>(json.result.data);

  const manifestDb = await getManifestDb();
  const tx = manifestDb.transaction(objectStoreName, 'readwrite');
  const store = tx.objectStore(objectStoreName);
  const exists = await store.count(deserialized.id);
  if (exists) {
    await store.put(deserialized);
  } else {
    await store.add(deserialized);
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
  } catch (e: any) {
    console.log(`Request failed`, e);

    // TODO: check response for statuscode
    // since we don't want to eat unauthorized errors

    const manifestDb = await getManifestDb();
    const cachedItems = await manifestDb.getAll(objectStoreName);

    return encodeCacheResultForTrpc(cachedItems);
  }
};

const cacheSingleResponse = async (
  dbName: ObjectStoreName,
  event: RouteHandlerCallbackOptions,
) => {
  try {
    const response = await fetch(event.request);

    if (response.status >= 200 && response.status < 300) {
      updateSingleCache(dbName, response.clone());
    }

    return response;
  } catch (e: any) {
    console.log(`Request failed`, e);

    // TODO: check response for statuscode
    // since we don't want to eat unauthorized errors

    const input = getTrpcInputForEvent<{ id: string }>(event);
    if (!input || !input.id) throw e;

    const manifestDb = await getManifestDb();
    const cachedItem = await manifestDb.get(dbName, input.id);

    return encodeCacheResultForTrpc(cachedItem);
  }
};

const APP_SRC_CACHE_NAME = 'app-asset-cache';
const APP_SRC_PRECACHE_URLS = ['/', '/index.html', '/locales/en-us.json'];
self.addEventListener('install', (event: any) => {
  console.log('Service Worker installed');

  event.waitUntil(
    caches
      .delete(APP_SRC_CACHE_NAME)
      .then(() =>
        caches
          .open(APP_SRC_CACHE_NAME)
          .then((cache) => cache.addAll(APP_SRC_PRECACHE_URLS)),
      ),
  );
});

self.addEventListener('activate', () => {
  console.log('Service Worker activated');
});

// Index should be cached networkFirst - this way, users will always get the newest application version
const MAX_OFFLINE_INDEX_AGE_DAYS = 60;
registerRoute(
  /(\/index\.html)|\//,
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
const MAX_LANGUAGE_AGE_DAYS = 30;
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

registerRoute(
  /api\/trpc\/artifact\.getArtifactById/,
  async (event) => {
    return cacheSingleResponse(ObjectStoreName.Artifacts, event);
  },
  'GET',
);

registerRoute(
  /api\/trpc\/artifact\.getArtifacts/,
  async (event) => {
    return cacheListResponse(ObjectStoreName.Artifacts, event);
  },
  'GET',
);

registerRoute(
  /api\/trpc\/artifact\.searchArtifacts/,
  async (event) => {
    try {
      const response = await fetch(event.request);

      return response;
    } catch (e) {
      const input = getTrpcInputForEvent<{ query: string }>(event);
      if (!input || !input.query) throw e;

      const searchManager = await searchManagerP;
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
        results.push(artifact);
      }

      return encodeCacheResultForTrpc(results);
    }
  },
  'GET',
);
