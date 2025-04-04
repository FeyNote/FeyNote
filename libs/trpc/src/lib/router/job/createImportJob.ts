import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { FilePurpose, JobStatus, JobType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
  generateS3Key,
  getSignedUrlForFilePurpose,
} from '@feynote/api-services';
import { ImportJobType } from '@feynote/prisma/types';

const TIME_LIMIT_OF_JOBS = 5; //In minutes
const NUMBER_OF_JOBS_PER_TIME_LIMIT = 10;
const TTL_S3_PRESIGNED_URL = 86400; // 24 hours in sec

export const createImportJob = authenticatedProcedure
  .input(
    z.object({
      name: z.string(),
      mimetype: z.string(),
      type: z.nativeEnum(ImportJobType),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const userId = ctx.session.userId;
    const mostRecentJobs = await prisma.job.findMany({
      select: {
        createdAt: true,
      },
      where: {
        userId,
        type: JobType.Import,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: NUMBER_OF_JOBS_PER_TIME_LIMIT,
    });
    // Ensure number of jobs created doesn't surpass allowable limits within a given timeframe
    if (
      mostRecentJobs.length &&
      mostRecentJobs.length >= NUMBER_OF_JOBS_PER_TIME_LIMIT
    ) {
      const lastJobToCheck = mostRecentJobs[NUMBER_OF_JOBS_PER_TIME_LIMIT - 1];
      const timelimit = new Date();
      timelimit.setMinutes(timelimit.getMinutes() - TIME_LIMIT_OF_JOBS);
      if (lastJobToCheck.createdAt > timelimit) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
        });
      }
    }

    const storageKey = generateS3Key();
    const purpose = FilePurpose.job;
    const s3SignedURL = await getSignedUrlForFilePurpose({
      key: storageKey,
      operation: 'putObject',
      purpose,
      expiresInSeconds: TTL_S3_PRESIGNED_URL,
    });

    const { importJobId } = await prisma.$transaction(async (tx) => {
      const importJob = await tx.job.create({
        data: {
          userId,
          status: JobStatus.NotStarted,
          type: JobType.Import,
          meta: {
            importType: input.type,
            s3Key: storageKey,
          },
        },
      });
      await tx.file.create({
        data: {
          userId,
          storageKey: storageKey,
          purpose,
          mimetype: input.mimetype,
          name: input.name,
          jobId: importJob.id,
          metadata: {},
        },
      });
      return { importJobId: importJob.id };
    });
    return { importJobId, s3SignedURL };
  });
