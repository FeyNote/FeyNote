import { importFromZip } from './importFromZip';
import { logseqToStandardizedImport } from './logseq/logseqToStandardizedImport';
import { obsidianToStandardizedImport } from './obsidian/obsidianToStandardizedImport';
import { prisma } from '@feynote/prisma/client';
import { type JobSummary } from '@feynote/prisma/types';
import { JobProgressTracker } from '../JobProgressTracker';
import { textMdToStandardizedImport } from './textMdToStandardizedImport';
import { docxToStandardizedImport } from './docxToStandardizedImport';

export const importJobHandler = async (job: JobSummary) => {
  const importFormat = job.meta.importFormat;
  if (!importFormat) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }
  const importFile = await prisma.file.findFirst({
    where: {
      jobId: job.id,
    },
  });
  if (!importFile) {
    throw new Error(`Import file not found for triggered job: ${job.id}`);
  }
  if (!importFormat || !importFile.storageKey) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

  const progressTracker = new JobProgressTracker(job.id, 2);

  switch (importFormat) {
    case 'obsidian':
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths) =>
          obsidianToStandardizedImport({ job, filePaths, progressTracker }),
        progressTracker,
      });
      break;
    case 'logseq':
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths) =>
          logseqToStandardizedImport({ job, filePaths, progressTracker }),
        progressTracker,
      });
      break;
    case 'markdown':
    case 'text':
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths) =>
          textMdToStandardizedImport({ job, filePaths, progressTracker }),
        progressTracker,
      });
      break;
    case 'gdrive':
    case 'docx':
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths, extractDest) =>
          docxToStandardizedImport({ job, filePaths, extractDest, progressTracker }),
        progressTracker,
      });
      break;
    default:
      throw new Error(
        `Invalid import format detected: ${importFormat} for job ${job.id}`,
      );
  }
};
