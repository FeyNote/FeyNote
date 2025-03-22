import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import {
  jobSummary,
  type ImportJob,
  type ExportJob,
  prismaJobSummaryToJobSummary,
} from '@feynote/prisma/types';
import { JobType } from '@prisma/client';

export const getImportExportJobs = authenticatedProcedure.query(
  async ({ ctx }): Promise<(ImportJob | ExportJob)[]> => {
    const importExportJobs = await prisma.job.findMany({
      where: {
        userId: ctx.session.userId,
        type: JobType.Import || JobType.Export,
      },
      ...jobSummary,
    });
    return importExportJobs.map(prismaJobSummaryToJobSummary);
  },
);
