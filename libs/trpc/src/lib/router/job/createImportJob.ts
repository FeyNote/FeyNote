import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { FilePurpose, JobStatus, JobType, type Job } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { enqueueJob } from '@feynote/queue';
import { ImportJobStreamDecoder } from '@feynote/shared-utils';
import type { ParserZodEsque } from '@trpc/server/unstable-core-do-not-import';
import { octetInputParser } from '@trpc/server/http';
import {
  FileSizeLimitError,
  transformAndUploadFileToS3ForUser,
} from '@feynote/api-services';
import type { ReadableStream as NodeWebReadableStream } from 'stream/web';
import { Readable } from 'stream';

type UtilityParser<TInput, TOutput> = ParserZodEsque<TInput, TOutput> & {
  parse: (input: unknown) => TOutput;
};
type OctetInput = Blob | Uint8Array | File;

const TIME_LIMIT_OF_JOBS = 5; // In minutes
const NUMBER_OF_JOBS_PER_TIME_LIMIT = 5;

export const createImportJob = authenticatedProcedure
  .input(octetInputParser as UtilityParser<OctetInput, ReadableStream>)
  .mutation(async ({ ctx, input: _input }): Promise<Job> => {
    const input = await new ImportJobStreamDecoder(_input).decode();

    const userId = ctx.session.userId;
    // Get the most recent jobs within the time limit
    const mostRecentJobs = await prisma.job.findMany({
      select: {
        createdAt: true,
      },
      where: {
        userId,
        type: JobType.import,
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

    try {
      console.log(`recieved file with mimetype; ${input.mimetype}`)
      const { uploadResult, transformedMimetype } =
        await transformAndUploadFileToS3ForUser({
          userId: ctx.session.userId,
          file: Readable.fromWeb(input.fileContents as NodeWebReadableStream),
          purpose: FilePurpose.job,
          mimetype: input.mimetype,
        });

      const { importJob } = await prisma.$transaction(async (tx) => {
        const importJob = await tx.job.create({
          data: {
            userId,
            status: JobStatus.notstarted,
            type: JobType.import,
            progress: 0,
            meta: {
              importFormat: input.format,
            },
          },
        });
        await tx.file.create({
          data: {
            id: input.id,
            userId: ctx.session.userId,
            name: input.fileName,
            mimetype: transformedMimetype,
            storageKey: uploadResult.key,
            purpose: FilePurpose.job,
            jobId: importJob.id,
            metadata: {
              uploadResult,
            },
          },
        });
        return { importJob: importJob };
      });

      enqueueJob({
        triggeredByUserId: ctx.session.userId,
        jobId: importJob.id,
      });

      return importJob;
    } catch (e) {
      if (e instanceof FileSizeLimitError) {
        throw new TRPCError({
          message: 'File size exceeds maximum allowed size',
          code: 'PAYLOAD_TOO_LARGE',
        });
      }

      throw e;
    }
  });
