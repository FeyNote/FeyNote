import { rm } from 'fs/promises';
import { downloadFileFromS3 } from './utils/downloadFileFromS3';
import { extractFilesFromZip } from './utils/extractFilesFromZip';
import type { StandardizedImportInfo } from './StandardizedImportInfo';
import { writeStandardizedImport } from './writeStandardizedImport';

export const importFromZip = async (
  storageKey: string,
  userId: string,
  processor: (filePaths: string[]) => Promise<StandardizedImportInfo>
) => {
  const zipDest = await downloadFileFromS3(storageKey);
  const { filePaths, extractDest } = await extractFilesFromZip(zipDest);
  if (!filePaths) return;

  const importInfo = await processor(filePaths);
  await writeStandardizedImport(importInfo, userId);

  await rm(zipDest, { recursive: true });
  await rm(extractDest, { recursive: true });
}
