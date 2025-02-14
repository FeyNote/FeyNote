import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { publicProcedure } from '../../trpc';
import { getArtifactAccessLevel as _getArtifactAccessLevel } from '@feynote/api-services';
import { ArtifactAccessLevel } from '@prisma/client';

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
        select: {
          id: true,
          userId: true,
          artifactCollectionId: true,
          linkAccessLevel: true,
        },
      });

      if (!artifact) {
        throw new TRPCError({
          message: 'Artifact does not exist',
          code: 'NOT_FOUND',
        });
      }

      const accessLevel = await _getArtifactAccessLevel({
        artifact,
        currentUserId: ctx.session?.userId,
      });

      return {
        accessLevel,
      };
    },
  );
