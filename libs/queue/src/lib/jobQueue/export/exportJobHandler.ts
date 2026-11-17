import { transformArtifactsToArtifactExports } from './transformArtifactsToExportFormat';
import ZipStream from 'zip-stream';
import {
  getSignedFileUrlsForReadableArtifacts,
  uploadFileToS3,
} from '@feynote/api-services';
import { FilePurpose, type Prisma } from '@prisma/client';
import { prisma } from '@feynote/prisma/client';
import { PassThrough } from 'stream';
import { artifactWithReferences } from './artifactReferenceSummary';
import { JobErrorCode, type JobSummary } from '@feynote/prisma/types';
import { JobProgressTracker } from '../JobProgressTracker';
import { logger } from '@feynote/api-services';
import { reserveUniqueExportFilename } from './reserveUniqueExportFilename';
import { getUserCanReadAllArtifacts } from './getUserCanReadAllArtifacts';

const markJobArtifactsUnavailable = async (job: JobSummary) => {
  await prisma.job.update({
    where: { id: job.id },
    data: {
      meta: {
        ...job.meta,
        error: JobErrorCode.ExportArtifactsUnavailable,
      },
    },
  });
  return new Error(`Export job requested unavailable artifacts: ${job.id}`);
};

export const exportJobHandler = async (job: JobSummary) => {
  const jobFormat = job.meta.exportFormat;
  if (!jobFormat) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

  const artifactIds = job.meta.exportArtifactIds;

  if (
    artifactIds &&
    !(await getUserCanReadAllArtifacts(job.userId, artifactIds))
  ) {
    throw await markJobArtifactsUnavailable(job);
  }

  const artifactWhere: Prisma.ArtifactWhereInput = artifactIds
    ? { id: { in: artifactIds }, deletedAt: null }
    : { userId: job.userId, deletedAt: null };

  const signedUrlByFileId = await getSignedFileUrlsForReadableArtifacts(
    job.userId,
    artifactIds ?? [],
  );
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

  logger.info(`Export Job: Beginning Upload of ZipStream to S3`);
  const uploadP = uploadFileToS3(passThrough, mimetype, FilePurpose.job);
  const totalArtifactCount = await prisma.artifact.count({
    where: artifactWhere,
  });
  const progressTracker = new JobProgressTracker({
    userId: job.userId,
    jobId: job.id,
    stepCount: 1,
  });

  const usedFilenames = new Set<string>();
  let exportedArtifactCount = 0;

  try {
    const batchSize = 50;
    let hasMore = true;
    let offset = 0;
    do {
      const artifactsWithReferences = await prisma.artifact.findMany({
        where: artifactWhere,
        orderBy: { id: 'asc' },
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

      logger.info(
        `Export Job: Working on converting ${artifactsWithReferences.length + 1} into ${jobFormat}`,
      );
      const artifactExports = transformArtifactsToArtifactExports(
        artifactsWithReferences,
        jobFormat,
        signedUrlByFileId,
      );

      for (const artifactExport of artifactExports) {
        await new Promise<void>((resolve, reject) => {
          zipStream.entry(
            artifactExport.content,
            {
              name: reserveUniqueExportFilename(
                usedFilenames,
                artifactExport.sanitizedTitle,
                artifactExport.extension,
              ),
            },
            (err) => {
              if (err) reject(err);
              else resolve();
            },
          );
        });
      }

      exportedArtifactCount += artifactExports.length;
      offset += batchSize;

      progressTracker.onProgress({
        progress: Math.floor(
          (Math.min(offset, totalArtifactCount) / totalArtifactCount) * 100,
        ),
        step: 1,
      });
    } while (hasMore);

    if (artifactIds && exportedArtifactCount !== artifactIds.length) {
      throw await markJobArtifactsUnavailable(job);
    }
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
