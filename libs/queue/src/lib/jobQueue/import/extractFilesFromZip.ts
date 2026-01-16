import { readdir } from 'fs/promises';
import { join } from 'path';
import extract from 'extract-zip';
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
  await extract(zipPath, {
    dir: extractDest,
    onEntry: (_, __) => {
      fileCounter++;
      if (fileCounter > MAX_FILE_LIMIT) {
        throw new FileLimitExceededError();
      }
    },
  });

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
