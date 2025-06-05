import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { JobStatus, JobType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { ImportFormat } from '@feynote/prisma/types';
import { enqueueJob } from '@feynote/queue';

const TIME_LIMIT_OF_JOBS = 5; // In minutes
const NUMBER_OF_JOBS_PER_TIME_LIMIT = 5;

export const createImportJob = authenticatedProcedure
  .input(
    z.object({
      format: z.nativeEnum(ImportFormat),
      fileId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.userId;
    // Get the most recent jobs within the time limit
    const mostRecentJobs = await prisma.job.findMany({
      select: {
        createdAt: true,
      },
      where: {
        userId,
        type: JobType.Import,
        createdAt: {
          gte: new Date(Date.now() - TIME_LIMIT_OF_JOBS * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
    // Check if the number of jobs created has surpassed allowable limits
    if (
      mostRecentJobs.length &&
      mostRecentJobs.length >= NUMBER_OF_JOBS_PER_TIME_LIMIT
    ) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
      });
    }

    const file = await prisma.file.findUnique({
      where: {
        id: input.fileId,
        userId: ctx.session.userId,
      },
    });

    if (!file) {
      throw new TRPCError({
        message: 'File with the provided id does not exist or is not accessible to the user',
        code: 'NOT_FOUND',
      });
    }

    const { importJob } = await prisma.$transaction(async (tx) => {
      const importJob = await tx.job.create({
        data: {
          userId,
          status: JobStatus.NotStarted,
          type: JobType.Import,
          progress: 20,
          meta: {
            importFormat: input.format,
          },
        },
      });
      await tx.file.update({
        where: {
          id: input.fileId,
        },
        data: {
          jobId: importJob.id,
        },
      });
      return { importJob: importJob };
    });
    enqueueJob({
      triggeredByUserId: ctx.session.userId,
      jobId: importJob.id,
    });
    return importJob
  });
