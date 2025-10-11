import {
  getKvStoreEntry,
  getManifestDb,
  KVStoreKeys,
  ObjectStoreName,
  type trpc,
} from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerGetArtifactSnapshotsRoute() {
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
}
