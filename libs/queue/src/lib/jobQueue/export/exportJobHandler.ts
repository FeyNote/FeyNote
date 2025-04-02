import {
  type ExportJob,
} from '@feynote/prisma/types';
import {
  transformArtifactsToArtifactExports,
} from './transformArtifactsToExportFormat';
import { getUserArtifacts } from './getUserArtifacts';
import ZipStream from 'zip-stream';
import { uploadFileToS3 } from '@feynote/api-services';
import { FilePurpose } from '@prisma/client';
import { prisma } from '@feynote/prisma/client';

export const exportJobHandler = async (job: ExportJob, userId: string) => {
  const jobType = job.meta.exportType;
  if (!jobType) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

  const mimetype = 'application/zip';
  const pipe = new ZipStream();
  const pipeProcessingP = new Promise<void>((resolve, reject) => {
    let errored = false;
    pipe.on('error', (err) => {
      errored = true;
      reject(err);
    });
    pipe.on('end', () => {
      if (!errored) resolve();
    });
  });
  const uploadP = uploadFileToS3(pipe, mimetype, FilePurpose.job);

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
          pipe.entry(artifactExport.content, { name: artifactExport.title }, (err) => {
            if (err) reject(err);
            else resolve();
          })
        })
      }

      offset += batchSize;
    } while (hasMore);
  } catch (err) {
    pipe.end(err);
    pipe.destroy();
    pipeProcessingP.catch(() => {});
    uploadP.catch(() => {});

    throw err;
  }

  pipe.finish();
  await pipeProcessingP;
  const uploadInfo = await uploadP;
  pipe.destroy();

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
  })
};
