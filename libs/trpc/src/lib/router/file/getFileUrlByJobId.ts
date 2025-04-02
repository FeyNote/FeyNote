import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import {
  getSignedUrlForFilePurpose,
} from '@feynote/api-services';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { FilePurpose } from '@prisma/client';
import { TRPCError } from '@trpc/server';

const SIGNED_URL_EXPIRATION_SECONDS = 86400;

export const getFileUrlByJobId = authenticatedProcedure
  .input(
    z.object({
      jobId: z.string(),
    }),
  )
  .query(async ({ ctx, input }): Promise<string> => {
    const file = await prisma.file.findFirst({
      where: {
        id: input.jobId,
        userId: ctx.session.userId,
        purpose: FilePurpose.job,
      },
    });

    if (!file) {
      throw new TRPCError({
        message: 'File does not exist for the given job id',
        code: 'NOT_FOUND',
      });
    }

    const url = getSignedUrlForFilePurpose({
      key: file.storageKey,
      operation: 'getObject',
      purpose: file.purpose,
      expiresInSeconds: SIGNED_URL_EXPIRATION_SECONDS,
    })

    return url;
  });
