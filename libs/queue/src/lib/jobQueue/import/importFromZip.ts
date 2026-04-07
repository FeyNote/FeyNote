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
import { logger } from '@feynote/api-services';

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

  logger.info('Import Job: Beginning File Stream From S3');
  const stream = await streamFileFromS3(args.storageKey, purpose);
  const zipPath = join(tempWorkingDir.path, 'blob');
  await saveFileStreamToDisk(stream, zipPath);
  logger.info('Import Job: Extracting Files From Zip');
  const filePaths = await extractFilesFromZip(zipPath, tempWorkingDir.path);
  if (!filePaths) return;

  logger.info(
    `Import Job: Beginning Conversion from ${args.job.meta.importFormat}`,
  );
  const importInfo = await args.processor(filePaths, tempWorkingDir.path);
  logger.info(
    `Import Job: Uploading ${importInfo.mediaFilesToUpload.length + 1} media files`,
  );
  await writeStandardizedImport({
    importInfo,
    job: args.job,
    progressTracker: args.progressTracker,
  });
};
