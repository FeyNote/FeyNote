import { type ExportJob } from '@feynote/prisma/types';
import { transformArtifactsToArtifactExports } from './transformArtifactsToExportFormat';
import { getUserArtifacts } from './getUserArtifacts';
import ZipStream from 'zip-stream';
import { uploadFileToS3 } from '@feynote/api-services';
import { FilePurpose } from '@prisma/client';
import { prisma } from '@feynote/prisma/client';
import { PassThrough } from 'stream';

export const exportJobHandler = async (job: ExportJob, userId: string) => {
  const jobType = job.meta.exportType;
  if (!jobType) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

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

  try {
    const batchSize = 50;
    let hasMore = true;
    let offset = 0;
    do {
      const artifacts = await getUserArtifacts({
        userId,
        offset,
        batchSize,
      });

      if (artifacts.length < batchSize) {
        hasMore = false;
      }
      if (artifacts.length === 0) {
        continue;
      }

      const artifactExports = transformArtifactsToArtifactExports(
        artifacts,
        jobType,
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
    } while (hasMore);
  } catch (err) {
    zipStream.end(err);
    zipStream.destroy();
    passThrough.end(err);
    pipeProcessingP.catch((e) => console.error(e));
    uploadP.catch((e) => console.error(e));

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
      userId,
      name,
      mimetype,
      storageKey: uploadInfo.key,
      purpose: FilePurpose.job,
      jobId: job.id,
      metadata: {},
    },
  });
};
