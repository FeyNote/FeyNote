import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { JobStatus } from '@prisma/client';
import { enqueueImportJob } from '@feynote/queue';

export const startImportJob = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<void> => {
    const userId = ctx.session.userId;
    console.log(input.id)
    const importJob = await prisma.importJob.findUnique({
      where: {
        id: input.id,
        userId: userId,
      },
      select: {
        id: true,
        status: true,
        type: true,
        file: {
          select: {
            storageKey: true,
          }
        },
      }
    });
    if (!importJob) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    if (importJob.status === JobStatus.InProgress) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
      });
    }
    await prisma.importJob.update({
      where: {
        id: input.id,
        userId,
      },
      data: {
        status: JobStatus.NotStarted,
      }
    });
    enqueueImportJob({
      triggeredByUserId: ctx.session.userId,
      importJobId: importJob.id,
    })
  });
