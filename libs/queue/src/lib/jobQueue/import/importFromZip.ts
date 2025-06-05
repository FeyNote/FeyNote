import { rm } from 'fs/promises';
import { getFileFromS3 } from './getFileFromS3';
import { extractFilesFromZip } from './extractFilesFromZip';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { writeStandardizedImport } from './writeStandardizedImport';

export const importFromZip = async (
  storageKey: string,
  userId: string,
  processor: (filePaths: string[]) => Promise<StandardizedImportInfo>,
) => {
  const zipDest = await getFileFromS3(storageKey);
  const { filePaths, extractDest } = await extractFilesFromZip(zipDest);
  if (!filePaths) return;

  const importInfo = await processor(filePaths);
  await writeStandardizedImport(importInfo, userId);

  await rm(zipDest, { recursive: true });
  await rm(extractDest, { recursive: true });
};
