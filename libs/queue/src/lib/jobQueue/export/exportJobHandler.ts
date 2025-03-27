import { type ArtifactReferenceSummary, type ExportJob } from '@feynote/prisma/types';
import { transformArtifactsToArtifactExports, type ArtifactExport } from './transformArtifactsToExportFormat';
import { getUserArtifacts } from './getUserArtifacts';
import ZipStream from 'zip-stream';
import { FILE_PURPOSE_TO_BUCKET, generateS3Key } from '@feynote/api-services';
import { FilePurpose } from '@prisma/client';
import { getS3Client } from 'libs/api-services/src/lib/s3/getS3Client';
import { PassThrough } from 'stream';

const streamToZip = (artifactExports: ArtifactExport[], zipStream: ZipStream) => {
  zipStream.on('error', (err) => {
    throw err
  })
  for (const artifactExport of artifactExports) {
    zipStream.entry(artifactExport.content, { name: artifactExport.title })
  }
}

export const exportJobHandler = async (job: ExportJob, userId: string) => {
  const jobType = job.meta.exportType;
  if (!jobType) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }
  console.log(`job: ${JSON.stringify(job)}`);
  let iterations = 0
  const passThrough = new PassThrough()
  const zipStream = new ZipStream()
  zipStream.pipe(passThrough)
  const storageKey = generateS3Key()
  const bucket = FILE_PURPOSE_TO_BUCKET[FilePurpose.job];
  const s3UploadParams = {
      Bucket: bucket,
      Key: storageKey,
      Body: passThrough,
      ContentType: 'application/zip',
  };
  const s3 = getS3Client()
  const s3UploadStream = s3.send({
      ...s3UploadParams,
      Body: zipStream,  // Pipe the zip stream to S3
  });

  const getArtifactsCallback = (artifacts: ArtifactReferenceSummary[]) => {
      if (!artifacts.length) return
      const artifactExports = transformArtifactsToArtifactExports(artifacts, jobType)
      streamToZip(artifactExports, zipStream)
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
  zipStream.finish()
};
