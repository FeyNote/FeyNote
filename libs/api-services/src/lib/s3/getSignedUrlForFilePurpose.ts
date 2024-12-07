import { FilePurpose } from '@prisma/client';
import { FILE_PURPOSE_TO_BUCKET } from './FILE_PURPOSE_TO_BUCKET';
import { getSignedUrl } from './getSignedUrl';

export async function getSignedUrlForFilePurpose(args: {
  key: string;
  operation: 'getObject' | 'putObject';
  purpose: FilePurpose;
  expiresInSeconds: number;
}): Promise<string> {
  const bucket = FILE_PURPOSE_TO_BUCKET[args.purpose];
  if (!bucket) {
    throw new Error('Invalid purpose');
  }

  return getSignedUrl({
    key: args.key,
    bucket,
    operation: args.operation,
    expiresInSeconds: args.expiresInSeconds,
  });
}
