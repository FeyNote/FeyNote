import { createWriteStream } from 'fs';
import type Stream from 'stream';
import { pipeline } from 'stream/promises';

export const saveFileStreamToDisk = async (
  stream: Stream.Readable,
  destination: string,
) => {
  if (!stream) throw new Error('Error streaming file from s3');

  const fileStream = createWriteStream(destination);

  await pipeline(stream, fileStream);

  fileStream.close();
};
