import { transformArtifactsToArtifactExports } from './transformArtifactsToExportFormat';
import ZipStream from 'zip-stream';
import {
  getSignedFileUrlsForUser,
  uploadFileToS3,
} from '@feynote/api-services';
import { FilePurpose } from '@prisma/client';
import { prisma } from '@feynote/prisma/client';
import { PassThrough } from 'stream';
import { artifactWithReferences } from './artifactReferenceSummary';
import type { JobSummary } from '@feynote/prisma/types';
import { JobProgressTracker } from '../JobProgressTracker';

export const exportJobHandler = async (job: JobSummary) => {
  const jobFormat = job.meta.exportFormat;
  if (!jobFormat) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

  const userFileToS3Map = await getSignedFileUrlsForUser(job.userId);
  const mimetype = 'application/zip';
  const zipStream = new ZipStream();
  const passThrough = new PassThrough();
  zipStream.pipe(passThrough);
  const pipeProcessingP = new Promise<void>((resolve, reject) => {
    let errored = false;
    zipStream.on('error', (err) => {
      errored = true;
      reject(err);
    });
    zipStream.on('end', () => {
      if (!errored) resolve();
    });
  });
  const uploadP = uploadFileToS3(passThrough, mimetype, FilePurpose.job);
  const totalArtifactCount = await prisma.artifact.count({
    where: { userId: job.userId, deletedAt: null },
  });
  const progressTracker = new JobProgressTracker(job.id, 1);

  try {
    const batchSize = 50;
    let hasMore = true;
    let offset = 0;
    do {
      const artifactsWithReferences = await prisma.artifact.findMany({
        where: { userId: job.userId, deletedAt: null },
        ...artifactWithReferences,
        take: batchSize,
        skip: offset,
      });

      if (artifactsWithReferences.length < batchSize) {
        hasMore = false;
      }
      if (artifactsWithReferences.length === 0) {
        continue;
      }

      const artifactExports = transformArtifactsToArtifactExports(
        artifactsWithReferences,
        jobFormat,
        userFileToS3Map,
      );

      for (const artifactExport of artifactExports) {
        await new Promise<void>((resolve, reject) => {
          zipStream.entry(
            artifactExport.content,
            { name: artifactExport.title },
            (err) => {
              if (err) reject(err);
              else resolve();
            },
          );
        });
      }

      offset += batchSize;

      progressTracker.onProgress({
        progress: Math.floor((offset + batchSize / totalArtifactCount) * 100),
        step: 1,
      });
    } while (hasMore);
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown error');
    pipeProcessingP.catch(() => {
      // noop
    });
    uploadP.catch(() => {
      // noop
    });
    zipStream.destroy(error);
    passThrough.destroy(error);

    throw err;
  }

  zipStream.finalize();
  await pipeProcessingP;
  const uploadInfo = await uploadP;
  passThrough.end();
  zipStream.destroy();

  const name = `export-${new Date().toISOString()}.zip`;
  await prisma.file.create({
    data: {
      userId: job.userId,
      name,
      mimetype,
      storageKey: uploadInfo.key,
      purpose: FilePurpose.job,
      jobId: job.id,
      metadata: {},
    },
  });
};
