import { importFromZip } from './importFromZip';
import { logseqToStandardizedImport } from './logseq/logseqToStandardizedImport';
import { obsidianToStandardizedImport } from './obsidian/obsidianToStandardizedImport';
import { prisma } from '@feynote/prisma/client';
import { ImportFormat, type JobSummary } from '@feynote/prisma/types';

export const importJobHandler = async (job: JobSummary, userId: string) => {
  const importFormat = job.meta.importFormat;
  if (!importFormat) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }
  const importFile = await prisma.file.findFirst({
    where: {
      jobId: job.id,
      userId,
    },
  });
  if (!importFile) {
    throw new Error(`Import file not found for triggered job: ${job.id}`);
  }
  const s3Key = importFile.storageKey;
  if (!importFormat || !s3Key) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

  switch (importFormat) {
    case ImportFormat.Obsidian: {
      await importFromZip(s3Key, userId, (filePaths) =>
        obsidianToStandardizedImport(userId, filePaths),
      );
      break;
    }
    case ImportFormat.Logseq: {
      await importFromZip(s3Key, userId, (filePaths) =>
        logseqToStandardizedImport(userId, filePaths),
      );
      break;
    }
    default: {
      throw new Error(`Invalid import format detected: ${importFormat} for job ${job.id}`);
    }
  }
};
