import { rm } from 'fs/promises';
import { saveFileStreamToDisk } from './saveFileStreamToDisk';
import { extractFilesFromZip } from './extractFilesFromZip';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { writeStandardizedImport } from './writeStandardizedImport';
import { FilePurpose } from '@prisma/client';
import { streamFileFromS3 } from '@feynote/api-services';
import type { JobProgressTracker } from '../JobProgressTracker';
import type { JobSummary } from '@feynote/prisma/types';

export const importFromZip = async (args: {
  storageKey: string;
  job: JobSummary;
  processor: (filePaths: string[]) => Promise<StandardizedImportInfo>;
  progressTracker: JobProgressTracker;
}) => {
  const purpose = FilePurpose.job;
  const stream = await streamFileFromS3(args.storageKey, purpose);
  const zipDest = await saveFileStreamToDisk(stream);
  const { filePaths, extractDest } = await extractFilesFromZip(zipDest);
  if (!filePaths) return;

  const importInfo = await args.processor(filePaths);
  await writeStandardizedImport({
    importInfo,
    job: args.job,
    progressTracker: args.progressTracker,
  });

  await rm(zipDest, { recursive: true });
  await rm(extractDest, { recursive: true });
};
