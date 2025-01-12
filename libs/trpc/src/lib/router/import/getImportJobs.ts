import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { type ImportJobDTO } from '@feynote/global-types';
import { importJobSummary } from '@feynote/prisma/types';

export const getImportJobs = authenticatedProcedure.query(
  async ({ ctx }): Promise<ImportJobDTO[]> => {
    const importJobs = await prisma.importJob.findMany({
      where: { userId: ctx.session.userId },
      ...importJobSummary,
    });
    return importJobs;
  },
);
