import { tmpdir } from 'os';
import { join } from 'path';
import { createWriteStream } from 'fs';
import type Stream from 'stream';

export const saveFileStreamToDisk = async (stream: Stream.Readable) => {
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
