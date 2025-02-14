import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client } from './getS3Client';
import { FILE_PURPOSE_TO_BUCKET } from './FILE_PURPOSE_TO_BUCKET';
import { FilePurpose } from '@prisma/client';

export async function getFileFromS3(
  key: string,
  filePurpose: FilePurpose,
) {
  const bucket = FILE_PURPOSE_TO_BUCKET[filePurpose];
  const s3Client = getS3Client();
  const params = { Bucket: bucket, Key: key }

  const command = new GetObjectCommand(params);
  const response = await s3Client.send(command);

  return response.Body?.transformToByteArray();
}
