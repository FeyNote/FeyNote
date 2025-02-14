import {
  streamFileFromS3,
} from '@feynote/api-services';
import extract from 'extract-zip';
import { FilePurpose } from '@prisma/client';
import { tmpdir } from 'os';
import { join } from 'path';
import { createWriteStream, readdirSync } from 'fs';

class FileLimitExceededError extends Error {
  constructor() {
    super('FileLimitExceededError');
    this.name = 'FileLimitExceededError';
  }
}

const MAX_FILE_LIMIT = 10000
export const downloadZipFromS3 = async (key: string) => {
  const purpose = FilePurpose.import;
  const stream = await streamFileFromS3(key, purpose)
  if (!stream) throw new Error('BLEH') //TODO Construct this later

  const tempDir = tmpdir();
  const zipDest = join(tempDir, `${Date.now()}-${Math.random()}.zip`);
  const fileStream = createWriteStream(zipDest);

  await new Promise((resolve, reject) => {
    stream.pipe(fileStream).on('finish', resolve).on('error', reject);
  });

  fileStream.close();

  const extractDest = join(tempDir, `${Date.now()}-${crypto.randomUUID()}`);
  let fileCounter = 0
  await extract(zipDest, { dir: extractDest, onEntry: (_, __) => {
    fileCounter++;
    if (fileCounter > MAX_FILE_LIMIT) {
      throw new FileLimitExceededError();
    }
  }});

  const filePaths = readdirSync(extractDest, { recursive: true }).map(
    (filePath) => join(extractDest, filePath.toString()),
  );
  return { filePaths, zipDest, extractDest };
}
