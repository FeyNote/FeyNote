import { readdir } from 'fs/promises';
import { join } from 'path';
import extract from 'extract-zip';
import { tmpdir } from 'os';

class FileLimitExceededError extends Error {
  constructor() {
    super('FileLimitExceededError');
    this.name = 'FileLimitExceededError';
  }
}

const MAX_FILE_LIMIT = 10000;
export const extractFilesFromZip = async (zipDest: string) => {
  const tempDir = tmpdir();
  const extractDest = join(tempDir, `${Date.now()}-${crypto.randomUUID()}`);
  let fileCounter = 0;
  await extract(zipDest, {
    dir: extractDest,
    onEntry: (_, __) => {
      fileCounter++;
      if (fileCounter > MAX_FILE_LIMIT) {
        throw new FileLimitExceededError();
      }
    },
  });

  const filePaths = (await readdir(extractDest, { recursive: true })).map(
    (filePath) => join(extractDest, filePath.toString()),
  );
  return { filePaths, extractDest };
};
