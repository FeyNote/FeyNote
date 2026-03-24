import type { WorkspaceSnapshot } from '@feynote/global-types';
import { trpc } from '../utils/trpc';
import {
  getManifestDb,
  getKvStoreEntry,
  KVStoreKeys,
  ObjectStoreName,
} from '../utils/localDb/localDb';

const VALID_DAYS = 30;

export async function getWorkspaceSnapshotsAction(): Promise<
  WorkspaceSnapshot[]
> {
  try {
    const syncValidWindow = new Date();
    syncValidWindow.setDate(syncValidWindow.getDate() - VALID_DAYS);
    const lastSyncedAt = await getKvStoreEntry(KVStoreKeys.LastSyncedAt);

    if (!lastSyncedAt || lastSyncedAt < syncValidWindow) {
      return await trpc.workspace.getWorkspaceSnapshots.query();
    }

    const manifestDb = await getManifestDb();
    return await manifestDb.getAll(ObjectStoreName.WorkspaceSnapshots);
  } catch {
    return trpc.workspace.getWorkspaceSnapshots.query();
  }
}
