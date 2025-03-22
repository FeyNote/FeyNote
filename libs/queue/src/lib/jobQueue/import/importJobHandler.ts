import { ImportJobType, type ImportJob } from '@feynote/prisma/types';
import { importFromZip } from './importFromZip';
import { logseqToStandardizedImport } from './logseq/logseqToStandardizedImport';
import { obsidianToStandardizedImport } from './obsidian/obsidianToStandardizedImport';

export const importJobHandler = async (job: ImportJob, userId: string) => {
  const jobType = job.meta.importType;
  const s3Key = job.meta?.s3Key;
  if (!jobType || !s3Key) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

  switch (jobType) {
    case ImportJobType.Obsidian: {
      await importFromZip(s3Key, userId, (filePaths) =>
        obsidianToStandardizedImport(userId, filePaths),
      );
      break;
    }
    case ImportJobType.Logseq: {
      await importFromZip(s3Key, userId, (filePaths) =>
        logseqToStandardizedImport(userId, filePaths),
      );
      break;
    }
  }
};
