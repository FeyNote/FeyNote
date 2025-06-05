import { streamFileFromS3 } from '@feynote/api-services';
import { FilePurpose } from '@prisma/client';
import { tmpdir } from 'os';
import { join } from 'path';
import { createWriteStream } from 'fs';

export const getFileFromS3 = async (key: string) => {
  const purpose = FilePurpose.job;
  const stream = await streamFileFromS3(key, purpose);
  if (!stream) throw new Error('Error streaming file from s3');

  const tempDir = tmpdir();
  const fileDest = join(tempDir, `${Date.now()}-${Math.random()}`);
  const fileStream = createWriteStream(fileDest);

  await new Promise<void>((resolve, reject) => {
    stream.pipe(fileStream).on('finish', resolve).on('error', reject);
  });

  fileStream.close();

  return fileDest;
};
