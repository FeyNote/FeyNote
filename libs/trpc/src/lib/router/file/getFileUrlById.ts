import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

import { artifactDetail } from '@feynote/prisma/types';
import {
  getSignedUrlForFilePurpose,
  hasArtifactAccess,
} from '@feynote/api-services';
import { publicProcedure } from '../../trpc';

const SIGNED_URL_EXPIRATION_SECONDS = 86400;

export const getFileUrlById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      shareToken: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }): Promise<string> => {
    const file = await prisma.file.findUnique({
      where: {
        id: input.id,
      },
    });

    if (!file) {
      throw new TRPCError({
        message: 'File does not exist',
        code: 'NOT_FOUND',
      });
    }

    if (file.purpose === 'artifact') {
      if (!file.artifactId) {
        throw new Error('File with purpose artifact has no artifact id');
      }

      const artifact = await prisma.artifact.findUnique({
        where: {
          id: file.artifactId,
        },
        ...artifactDetail,
      });

      if (
        !artifact ||
        !hasArtifactAccess(artifact, ctx.session?.userId, input.shareToken)
      ) {
        throw new TRPCError({
          message: 'You do not have access to this file',
          code: 'FORBIDDEN',
        });
      }
    }

    const url = getSignedUrlForFilePurpose({
      key: file.storageKey,
      operation: 'getObject',
      purpose: file.purpose,
      expiresInSeconds: SIGNED_URL_EXPIRATION_SECONDS,
    });

    return url;
  });
