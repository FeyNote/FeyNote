import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { JobStatus, JobType } from '@prisma/client';
import { ExportFormat } from '@feynote/prisma/types';
import { enqueueJob } from '@feynote/queue';

export const createExportJob = authenticatedProcedure
  .input(
    z.object({
      format: z.nativeEnum(ExportFormat),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.userId;
    const exportJob = await prisma.job.create({
      data: {
        userId,
        progress: 0,
        status: JobStatus.notstarted,
        type: JobType.export,
        meta: {
          exportFormat: input.format,
        },
      },
    });

    enqueueJob({
      triggeredByUserId: ctx.session.userId,
      jobId: exportJob.id,
    });
    return exportJob;
  });
