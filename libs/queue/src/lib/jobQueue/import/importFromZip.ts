import { mkdtempDisposable } from 'fs/promises';
import { saveFileStreamToDisk } from './saveFileStreamToDisk';
import { extractFilesFromZip } from './extractFilesFromZip';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { writeStandardizedImport } from './writeStandardizedImport';
import { FilePurpose } from '@prisma/client';
import { streamFileFromS3 } from '@feynote/api-services';
import type { JobProgressTracker } from '../JobProgressTracker';
import type { JobSummary } from '@feynote/prisma/types';
import { join } from 'path';

export const importFromZip = async (args: {
  storageKey: string;
  job: JobSummary;
  processor: (
    filePaths: string[],
    extractDest: string,
  ) => Promise<StandardizedImportInfo>;
  progressTracker: JobProgressTracker;
}) => {
  await using tempWorkingDir = await mkdtempDisposable('/tmp/');

  const purpose = FilePurpose.job;
  const stream = await streamFileFromS3(args.storageKey, purpose);
  const zipPath = join(tempWorkingDir.path, 'blob');
  await saveFileStreamToDisk(stream, zipPath);
  const filePaths = await extractFilesFromZip(zipPath, tempWorkingDir.path);
  if (!filePaths) return;

  const importInfo = await args.processor(filePaths, tempWorkingDir.path);
  await writeStandardizedImport({
    importInfo,
    job: args.job,
    progressTracker: args.progressTracker,
  });
};
