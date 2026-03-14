import type { JobSummary } from '@feynote/prisma/types';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function getJobsAction(input: {
  type?: 'import' | 'export';
  limit?: number;
  offset?: number;
}): Promise<{ jobs: JobSummary[]; totalCount: number }> {
  try {
    const result = await trpc.job.getJobs.query(input);
    const isFirstPage = !input.offset;
    if (isFirstPage) {
      try {
        const manifestDb = await getManifestDb();
        const tx = manifestDb.transaction(ObjectStoreName.Jobs, 'readwrite');
        const store = tx.objectStore(ObjectStoreName.Jobs);
        await store.clear();
        for (const item of result.jobs) {
          await store.put(item);
        }
        await tx.done;
      } catch {
        // Cache update failed, that's okay
      }
    }
    return result;
  } catch {
    const manifestDb = await getManifestDb();
    const cachedItems = await manifestDb.getAll(ObjectStoreName.Jobs);
    const sortedJobs = cachedItems
      .filter((jobSummary) => {
        return input.type ? jobSummary.type === input.type : true;
      })
      .sort((a, b) => {
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
    return { jobs: sortedJobs, totalCount: sortedJobs.length };
  }
}
