import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import {
  jobSummary,
  prismaJobSummaryToJobSummary,
  type JobSummary,
} from '@feynote/prisma/types';
import { JobType } from '@prisma/client';
import { z } from 'zod';

const MAX_NUM_OF_RETURNED_JOBS = 100

export const getJobs = authenticatedProcedure
  .input(
    z.object({
      type: z.nativeEnum(JobType).optional(),
    }),
  )
  .query(
    async ({
      input,
      ctx,
    }): Promise<{ jobs: JobSummary[] }> => {
      const jobs = await prisma.job.findMany({
        where: {
          userId: ctx.session.userId,
          type: input.type,
        },
        take: MAX_NUM_OF_RETURNED_JOBS,
        orderBy: {
          createdAt: 'desc',
        },
        ...jobSummary,
      });
      return {
        jobs: jobs.map(prismaJobSummaryToJobSummary),
      };
    },
  );
