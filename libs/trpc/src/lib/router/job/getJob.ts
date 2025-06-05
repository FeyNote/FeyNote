import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import {
  jobSummary,
  type JobSummary,
  prismaJobSummaryToJobSummary,
} from '@feynote/prisma/types';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';


export const getJob = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ input, ctx }): Promise<JobSummary> => {
    const job = await prisma.job.findUnique({
      where: {
        id: input.id,
        userId: ctx.session.userId,
      },
      ...jobSummary,
    });
    if (!job) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    return prismaJobSummaryToJobSummary(job);
  });
