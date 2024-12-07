import { Upload } from '@aws-sdk/lib-storage';
import { FilePurpose } from '@prisma/client';
import { Readable } from 'stream';
import { getS3Client } from './getS3Client';
import { FILE_PURPOSE_TO_BUCKET } from './FILE_PURPOSE_TO_BUCKET';
import { generateS3Key } from './generateS3Key';

const S3_DEFAULT_CACHECONTROL = 'public,max-age=31536000,immutable'; // 365 Days

export async function uploadFileToS3(
  file: Buffer | Readable,
  mimetype: string,
  purpose: FilePurpose,
) {
  const key = generateS3Key();
  const bucket = FILE_PURPOSE_TO_BUCKET[purpose];

  const uploadRef = new Upload({
    client: getS3Client(),
    params: {
      Bucket: bucket,
      Key: key,
      CacheControl: S3_DEFAULT_CACHECONTROL,
      Body: file,
      ContentType: mimetype,
    },
  });

  const s3Response = await uploadRef.done();

  return {
    key,
    location: s3Response.Location,
    bucket: bucket,
  };
}
