import {
  getKvStoreEntry,
  getManifestDb,
  KVStoreKeys,
  ObjectStoreName,
  type trpc,
} from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import * as Sentry from '@sentry/browser';

export function registerGetArtifactSnapshotsRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactSnapshots/,
    async (event) => {
      try {
        const manifestDb = await getManifestDb();

        const VALID_DAYS = 30;
        const syncValidWindow = new Date();
        syncValidWindow.setDate(syncValidWindow.getDate() - VALID_DAYS);
        const lastSyncedAt = await getKvStoreEntry(KVStoreKeys.LastSyncedAt);

        if (!lastSyncedAt || lastSyncedAt < syncValidWindow) {
          return fetch(event.request);
        }

        const snapshots = await manifestDb.getAll(
          ObjectStoreName.ArtifactSnapshots,
        );

        return encodeCacheResultForTrpc<
          typeof trpc.artifact.getArtifactSnapshots.query
        >(snapshots);
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return fetch(event.request);
      }
    },
    'GET',
  );
}
