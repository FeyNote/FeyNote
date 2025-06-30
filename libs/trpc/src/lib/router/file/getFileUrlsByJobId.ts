import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { getSignedUrlForFilePurpose } from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { FilePurpose } from '@prisma/client';
import { TRPCError } from '@trpc/server';

const SIGNED_URL_EXPIRATION_SECONDS = 86400;

export const getFileUrlsByJobId = authenticatedProcedure
  .input(
    z.object({
      jobId: z.string(),
    }),
  )
  .query(async ({ ctx, input }): Promise<string[]> => {
    const files = await prisma.file.findMany({
      where: {
        jobId: input.jobId,
        userId: ctx.session.userId,
        purpose: FilePurpose.job,
      },
    });

    if (!files.length) {
      throw new TRPCError({
        message: 'No files found for the given job id',
        code: 'NOT_FOUND',
      });
    }

    const signedUrls = [];
    for (const file of files) {
      const url = await getSignedUrlForFilePurpose({
        key: file.storageKey,
        operation: 'getObject',
        purpose: file.purpose,
        expiresInSeconds: SIGNED_URL_EXPIRATION_SECONDS,
      });
      signedUrls.push(url);
    }

    return signedUrls;
  });
