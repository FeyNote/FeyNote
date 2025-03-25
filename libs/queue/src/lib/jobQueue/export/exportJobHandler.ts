import { type ArtifactReferenceSummary, type ExportJob } from '@feynote/prisma/types';
import { transformArtifactsToExportFormat } from './transformArtifactsToExportFormat';
import { getUserArtifacts } from './getUserArtifacts';

export const exportJobHandler = async (job: ExportJob, userId: string) => {
  const jobType = job.meta.exportType;
  if (!jobType) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }
  console.log(`job: ${JSON.stringify(job)}`);
  let iterations = 0
  // const storageKey = randomUUID()
  const getArtifactsCallback = (artifacts: ArtifactReferenceSummary[]) => {
      if (!artifacts.length) return
      const bytes = transformArtifactsToExportFormat(artifacts, jobType)
      // streamBytesToZip({ bytes, storageKey })
      getUserArtifacts({
        userId,
        iterations: iterations++,
        callback: getArtifactsCallback,
      })
    }

  getUserArtifacts({
      userId,
      iterations,
      callback: getArtifactsCallback,
  })
};
