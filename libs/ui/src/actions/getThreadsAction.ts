import type { ThreadDTO } from '@feynote/shared-utils';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function getThreadsAction(): Promise<ThreadDTO[]> {
  try {
    const result = await trpc.ai.getThreads.query();
    try {
      const manifestDb = await getManifestDb();
      const tx = manifestDb.transaction(ObjectStoreName.Threads, 'readwrite');
      const store = tx.objectStore(ObjectStoreName.Threads);
      await store.clear();
      for (const item of result) {
        await store.put(item);
      }
      tx.commit();
      await tx.done;
    } catch {
      // Cache update failed, that's okay
    }
    return result;
  } catch {
    const manifestDb = await getManifestDb();
    return manifestDb.getAll(ObjectStoreName.Threads);
  }
}
