import { ThreadDTO, type ThreadDTOMessage } from '@feynote/global-types';
import { threadSummary } from '@feynote/prisma/types';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const getImportJobs = authenticatedProcedure.query(
  async ({ ctx }): Promise<ImportJobsDTO[]> => {
    const importJobsDto = await prisma.importJobs.findMany({
      where: { userId: ctx.session.userId },
      ...importSummary,
    });

    return importJobsDto satisfies ImportJobsDTO[];
  },
);
