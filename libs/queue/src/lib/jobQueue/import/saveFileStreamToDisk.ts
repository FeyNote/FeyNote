import { createWriteStream } from 'fs';
import type Stream from 'stream';

export const saveFileStreamToDisk = async (
  stream: Stream.Readable,
  destination: string,
) => {
  if (!stream) throw new Error('Error streaming file from s3');

  const fileStream = createWriteStream(destination);

  await new Promise<void>((resolve, reject) => {
    stream.pipe(fileStream).on('finish', resolve).on('error', reject);
  });

  fileStream.close();
};
