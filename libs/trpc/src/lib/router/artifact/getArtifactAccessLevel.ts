import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { publicProcedure } from '../../trpc';
import {
  getArtifactAccessLevel as _getArtifactAccessLevel,
  NegotiatedArtifactAccessLevel,
} from '@feynote/shared-utils';

export const getArtifactAccessLevel = publicProcedure
  .input(
    z.object({
      id: z.string(),
      shareToken: z.string().optional(),
    }),
  )
  .query(
    async ({
      ctx,
      input,
    }): Promise<{
      accessLevel: NegotiatedArtifactAccessLevel;
    }> => {
      if (!ctx.session) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

      const artifact = await prisma.artifact.findUnique({
        where: {
          id: input.id,
        },
        ...artifactDetail,
      });

      if (!artifact) {
        throw new TRPCError({
          message: 'Artifact does not exist',
          code: 'NOT_FOUND',
        });
      }

      const accessLevel = _getArtifactAccessLevel(
        artifact,
        input.shareToken,
        ctx.session?.userId,
      );

      return {
        accessLevel,
      };
    },
  );
