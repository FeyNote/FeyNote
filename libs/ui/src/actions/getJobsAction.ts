import type { JobSummary } from '@feynote/prisma/types';
import { trpc } from '../utils/trpc';
import { getManifestDb, ObjectStoreName } from '../utils/localDb/localDb';

export async function getJobsAction(input: {
  type?: 'import' | 'export';
}): Promise<JobSummary[]> {
  try {
    const jobs = await trpc.job.getJobsV2.query(input);
    try {
      const manifestDb = await getManifestDb();
      const tx = manifestDb.transaction(ObjectStoreName.Jobs, 'readwrite');
      const store = tx.objectStore(ObjectStoreName.Jobs);
      await store.clear();
      for (const item of jobs) {
        await store.put(item);
      }
      tx.commit();
      await tx.done;
    } catch {
      // Cache update failed, that's okay
    }
    return jobs;
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
    return sortedJobs;
  }
}
