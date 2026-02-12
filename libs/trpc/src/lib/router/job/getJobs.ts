import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import {
  jobSummary,
  prismaJobSummaryToJobSummary,
  type JobSummary,
} from '@feynote/prisma/types';
import { JobType } from '@prisma/client';
import { z } from 'zod';

const DEFAULT_JOB_LIMIT = 10; // Default number of jobs to fetch per request

export const getJobs = authenticatedProcedure
  .input(
    z.object({
      offset: z.number().default(0),
      limit: z.number().max(100).default(DEFAULT_JOB_LIMIT),
      type: z.nativeEnum(JobType).optional(),
    }),
  )
  .query(
    async ({
      input,
      ctx,
    }): Promise<{ jobs: JobSummary[]; totalCount: number }> => {
      const jobs = await prisma.job.findMany({
        where: {
          userId: ctx.session.userId,
          type: input.type,
        },
        skip: input.offset,
        take: input.limit,
        orderBy: {
          createdAt: 'desc',
        },
        ...jobSummary,
      });
      const totalCount = await prisma.job.count({
        where: {
          userId: ctx.session.userId,
          type: input.type,
        },
      });
      return {
        jobs: jobs.map(prismaJobSummaryToJobSummary),
        totalCount,
      };
    },
  );
