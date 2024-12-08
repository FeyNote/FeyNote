import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { ImportJobType, JobStatus } from '@prisma/client';

export const createImportJob = authenticatedProcedure
  .input(
    z.object({
      s3: z.string(),
      title: z.string(),
      type: z.nativeEnum(ImportJobType),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<void> => {
    await prisma.importJob.create({
      data: {
        userId: ctx.session.userId,
        title: input.title,
        s3: input.s3,
        type: input.type,
        status: JobStatus.InProgress,
      },
    });
  });
