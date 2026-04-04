import { readdir, mkdir } from 'fs/promises';
import { createWriteStream } from 'fs';
import { join, dirname } from 'path';
import { pipeline } from 'stream/promises';
import yauzl from 'yauzl-promise';
import { sanitizeFilePath } from '@feynote/api-services';

class FileLimitExceededError extends Error {
  constructor() {
    super('FileLimitExceededError');
    this.name = 'FileLimitExceededError';
  }
}

const MAX_FILE_LIMIT = 10000;
export const extractFilesFromZip = async (
  zipPath: string,
  extractDest: string,
) => {
  let fileCounter = 0;
  const zip = await yauzl.open(zipPath);
  try {
    for await (const entry of zip) {
      fileCounter++;
      if (fileCounter > MAX_FILE_LIMIT) {
        throw new FileLimitExceededError();
      }
      const fullPath = join(extractDest, entry.filename);
      if (entry.filename.endsWith('/')) {
        await mkdir(fullPath, { recursive: true });
      } else {
        await mkdir(dirname(fullPath), { recursive: true });
        const readStream = await entry.openReadStream();
        const writeStream = createWriteStream(fullPath);
        await pipeline(readStream, writeStream);
      }
    }
  } finally {
    await zip.close();
  }

  const filePaths = (await readdir(extractDest, { recursive: true })).map(
    (filePath) => {
      const joinedPath = join(extractDest, filePath.toString());
      const sanitizedPath = sanitizeFilePath({
        mustStartWith: extractDest,
        filePath: joinedPath,
      });
      return sanitizedPath;
    },
  );
  return filePaths;
};
