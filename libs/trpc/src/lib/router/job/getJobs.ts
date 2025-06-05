import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import {
  jobSummary,
  type JobSummary,
  prismaJobSummaryToJobSummary,
} from '@feynote/prisma/types';
import { JobType } from '@prisma/client';
import { z } from 'zod';

const DEFAULT_JOB_LIMIT = 10; // Default number of jobs to fetch per request

export const getJobs = authenticatedProcedure
  .input(
    z.object({
      offset: z.number().default(0),
      limit: z.number().default(DEFAULT_JOB_LIMIT),
      type: z.nativeEnum(JobType).optional(),
    }),
  )
.query(
  async ({ input, ctx }): Promise<{ jobs: JobSummary[], totalCount: number }> => {
    const importJobs = await prisma.job.findMany({
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
    console.log(`grabbed jobs: ${importJobs}`)
    const totalCount = await prisma.job.count({
      where: {
        userId: ctx.session.userId,
        type: JobType.Import,
      },
    })
    return {
      jobs: importJobs.map(prismaJobSummaryToJobSummary),
      totalCount,
    }
  },
);
