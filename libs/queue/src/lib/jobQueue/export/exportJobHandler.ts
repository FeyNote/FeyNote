import { ExportJobType, type ExportJob } from '@feynote/prisma/types';

export const exportJobHandler = async (job: ExportJob, _: string) => {
  const jobType = job.meta.exportType;
  if (!jobType) {
    throw new Error(`Job meta is invalid for its assigned type: ${job.id}`);
  }

  switch (jobType) {
    case ExportJobType.Markdown: {
      break;
    }
    case ExportJobType.Json: {
      break;
    }
  }
};
