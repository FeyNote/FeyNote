import { getManifestDb, ObjectStoreName } from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { tryStoreInCacheWithQuotaPurge } from '../../util/tryStoreInCacheWithQuotaPurge';
import * as Sentry from '@sentry/browser';

/**
 * Artifact assets are immutable. Should be cached indefinitely, but we need to limit them so
 * we don't "anger" the browser by caching too much
 */
const ARTIFACT_ASSET_CACHE_NAME = 'artifact-asset-cache';
const ARTIFACT_ASSET_CACHE_MAX_ENTRIES = 100;
export function registerFileRedirectRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/file\/(.*?)\/redirect/,
    async (event) => {
      const fileId = event.url.pathname.match(/\/file\/(.*?)\/redirect/)?.[1];
      if (!fileId) throw new Error('No fileId found in URL');

      try {
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
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return fetch(event.request);
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
}
