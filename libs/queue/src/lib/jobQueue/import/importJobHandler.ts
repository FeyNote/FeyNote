import { importFromZip } from './importFromZip';
import { logseqToStandardizedImport } from './logseq/logseqToStandardizedImport';
import { obsidianToStandardizedImport } from './obsidian/obsidianToStandardizedImport';
import { prisma } from '@feynote/prisma/client';
import { ImportFormat, type JobSummary } from '@feynote/prisma/types';
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
    case ImportFormat.Obsidian: {
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths) =>
          obsidianToStandardizedImport({ job, filePaths, progressTracker }),
        progressTracker,
      });
      break;
    }
    case ImportFormat.Logseq: {
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths) =>
          logseqToStandardizedImport({ job, filePaths, progressTracker }),
        progressTracker,
      });
      break;
    }
    case ImportFormat.TxtMd: {
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths) =>
          textMdToStandardizedImport({ job, filePaths, progressTracker }),
        progressTracker,
      });
      break;
    }
    case ImportFormat.Docx: {
      await importFromZip({
        storageKey: importFile.storageKey,
        job,
        processor: (filePaths) =>
          docxToStandardizedImport({ job, filePaths, progressTracker }),
        progressTracker,
      });
      break;
    }
    default: {
      throw new Error(
        `Invalid import format detected: ${importFormat} for job ${job.id}`,
      );
    }
  }
};
