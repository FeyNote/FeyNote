import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { publicProcedure } from '../../trpc';
import { getArtifactAccessLevel as _getArtifactAccessLevel } from '@feynote/shared-utils';
import type { ArtifactAccessLevel } from '@prisma/client';

export const getArtifactAccessLevel = publicProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(
    async ({
      ctx,
      input,
    }): Promise<{
      accessLevel: ArtifactAccessLevel;
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
        ctx.session?.userId,
      );

      return {
        accessLevel,
      };
    },
  );
