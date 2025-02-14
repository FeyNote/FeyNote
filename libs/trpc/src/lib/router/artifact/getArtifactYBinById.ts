import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { getArtifactAccessLevel } from '@feynote/api-services';
import { ArtifactAccessLevel } from '@prisma/client';

export const getArtifactYBinById = publicProcedure
  .input(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .query(
    async ({
      input,
      ctx,
    }): Promise<{
      yBin: Uint8Array;
    }> => {
      const artifact = await prisma.artifact.findUnique({
        where: {
          id: input.id,
        },
        select: {
          yBin: true,
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

      const accessLevel = await getArtifactAccessLevel({
        currentUserId: ctx.session?.userId,
        artifact,
      });

      if (accessLevel === ArtifactAccessLevel.noaccess) {
        throw new TRPCError({
          message: 'You do not have rights to view this artifact',
          code: 'NOT_FOUND',
        });
      }

      return {
        yBin: artifact.yBin,
      };
    },
  );
