import { getSignedUrl as s3SdkGetSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client } from './getS3Client';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export async function getSignedUrl(args: {
  key: string;
  bucket: string;
  operation: 'getObject' | 'putObject';
  expiresInSeconds: number;
}): Promise<string> {
  const s3 = getS3Client();

  let command: GetObjectCommand | PutObjectCommand;

  if (args.operation === 'getObject') {
    command = new GetObjectCommand({
      Bucket: args.bucket,
      Key: args.key,
    });
  } else if (args.operation === 'putObject') {
    command = new PutObjectCommand({
      Bucket: args.bucket,
      Key: args.key,
    });
  } else {
    throw new Error('Invalid operation');
  }

  const signedUrl = await s3SdkGetSignedUrl(s3, command, {
    expiresIn: args.expiresInSeconds,
  });

  return signedUrl;
}
