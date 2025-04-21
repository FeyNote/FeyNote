import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { JobStatus, JobType } from '@prisma/client';
import { ExportJobType } from '@feynote/prisma/types';

export const createExportJob = authenticatedProcedure
  .input(
    z.object({
      type: z.nativeEnum(ExportJobType),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.userId;
    const exportJob = await prisma.job.create({
      data: {
        userId,
        progress: 0,
        status: JobStatus.NotStarted,
        type: JobType.Export,
        meta: {
          exportType: input.type,
        },
      },
    });
    return exportJob.id;
  });
