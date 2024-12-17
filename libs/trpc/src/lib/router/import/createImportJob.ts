import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { FilePurpose, ImportJobType, JobStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import {
  generateS3Key,
  getSignedUrlForFilePurpose,
} from '@feynote/api-services';

const ALLOWED_MIN_BETWEEN_JOBS = 5;
const NUMBER_OF_JOBS_PER_LIMIT = 2;
const TTL_S3_PRESIGNED_URL = 86400; // 24 hours in sec

export const createImportJob = authenticatedProcedure
  .input(
    z.object({
      name: z.string(),
      mimetype: z.string(),
      type: z.nativeEnum(ImportJobType),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    const userId = ctx.session.userId;
    const mostRecentJobs = await prisma.importJob.findMany({
      select: {
        createdAt: true,
      },
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'asc',
      },
      take: NUMBER_OF_JOBS_PER_LIMIT,
    });
    // Ensure number of jobs created doesn't surpass allowable limits within a given timeframe
    if (
      mostRecentJobs.length &&
      mostRecentJobs.length === NUMBER_OF_JOBS_PER_LIMIT
    ) {
      const lastJobToCheck = mostRecentJobs[NUMBER_OF_JOBS_PER_LIMIT - 1];
      const timelimit = new Date();
      timelimit.setMinutes(timelimit.getMinutes() - ALLOWED_MIN_BETWEEN_JOBS);
      if (lastJobToCheck.createdAt > timelimit) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
        });
      }
    }

    const storageKey = generateS3Key();
    const purpose = FilePurpose.import;
    const s3SignedURL = await getSignedUrlForFilePurpose({
      key: storageKey,
      operation: 'putObject',
      purpose,
      expiresInSeconds: TTL_S3_PRESIGNED_URL,
    });

    await prisma.importJob.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        title: `${input.name}-${new Date()}`,
        status: JobStatus.InProgress,
        type: ImportJobType.Obsidian,
        file: {
          create: {
            userId,
            storageKey,
            purpose,
            mimetype: input.mimetype,
            name: input.name,
            metadata: {},
          },
        },
      },
    });
    return s3SignedURL;
  });
