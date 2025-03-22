import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { JobStatus } from '@prisma/client';
import { enqueueJob } from '@feynote/queue';

export const startJob = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<void> => {
    const userId = ctx.session.userId;
    const job = await prisma.job.findUnique({
      where: {
        id: input.id,
        userId: userId,
      },
      select: {
        id: true,
        status: true,
        type: true,
        meta: true,
      },
    });
    if (!job) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    if (job.status === JobStatus.InProgress) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
      });
    }
    enqueueJob({
      triggeredByUserId: ctx.session.userId,
      jobId: job.id,
    });
  });
