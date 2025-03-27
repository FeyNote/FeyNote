import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { hasArtifactAccess } from '@feynote/api-services';

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
          userId: true,
          artifactShares: {
            select: {
              id: true,
              userId: true,
              user: {
                select: {
                  name: true,
                },
              },
              accessLevel: true,
            },
          },
          linkAccessLevel: true,
        },
      });

      if (!artifact || !hasArtifactAccess(artifact, ctx.session?.userId)) {
        throw new TRPCError({
          message:
            'Artifact does not exist or is not visible to the current user',
          code: 'NOT_FOUND',
        });
      }

      return {
        yBin: artifact.yBin,
      };
    },
  );
