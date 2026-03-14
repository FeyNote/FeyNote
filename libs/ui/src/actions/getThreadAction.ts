import type { ThreadDTO } from '@feynote/shared-utils';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function getThreadAction(input: {
  id: string;
}): Promise<ThreadDTO> {
  try {
    const result = await trpc.ai.getThread.query(input);
    try {
      const manifestDb = await getManifestDb();
      await manifestDb.put(ObjectStoreName.Threads, result);
    } catch {
      // Cache update failed, that's okay
    }
    return result;
  } catch {
    const manifestDb = await getManifestDb();
    const cached = await manifestDb.get(ObjectStoreName.Threads, input.id);
    if (cached) return cached;
    throw new Error('Thread not found in cache');
  }
}
