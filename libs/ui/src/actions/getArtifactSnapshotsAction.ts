import type { ArtifactSnapshot } from '@feynote/global-types';
import { trpc } from '../utils/trpc';
import {
  getManifestDb,
  getKvStoreEntry,
  KVStoreKeys,
  ObjectStoreName,
} from '../utils/localDb/localDb';

const VALID_DAYS = 30;

export async function getArtifactSnapshotsAction(): Promise<
  ArtifactSnapshot[]
> {
  try {
    const syncValidWindow = new Date();
    syncValidWindow.setDate(syncValidWindow.getDate() - VALID_DAYS);
    const lastSyncedAt = await getKvStoreEntry(KVStoreKeys.LastSyncedAt);

    if (!lastSyncedAt || lastSyncedAt < syncValidWindow) {
      return await trpc.artifact.getArtifactSnapshots.query();
    }

    const manifestDb = await getManifestDb();
    return await manifestDb.getAll(ObjectStoreName.ArtifactSnapshots);
  } catch {
    return trpc.artifact.getArtifactSnapshots.query();
  }
}
