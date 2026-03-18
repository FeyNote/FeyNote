import { trpc } from '../utils/trpc';
import {
  getManifestDb,
  ObjectStoreName,
  type KnownUserDoc,
} from '../utils/localDb/localDb';

export async function getKnownUsersAction(): Promise<KnownUserDoc[]> {
  try {
    const result = await trpc.user.getKnownUsers.query();
    try {
      const manifestDb = await getManifestDb();
      const tx = manifestDb.transaction(
        ObjectStoreName.KnownUsers,
        'readwrite',
      );
      const store = tx.objectStore(ObjectStoreName.KnownUsers);
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
    return manifestDb.getAll(ObjectStoreName.KnownUsers);
  }
}
