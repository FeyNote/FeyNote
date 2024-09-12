import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { publicProcedure } from '../../trpc';
import { hasArtifactAccess } from '@feynote/api-services';

export const getArtifactYBinById = publicProcedure
  .input(
    z.object({
      id: z.string().uuid(),
      shareToken: z.string().optional(),
    }),
  )
  .query(
    async ({
      input,
      ctx,
    }): Promise<{
      yBin: Buffer;
    }> => {
      if (!ctx.session && !input.shareToken) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
        });
      }

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
          artifactShareTokens: {
            select: {
              id: true,
              shareToken: true,
              allowAddToAccount: true,
              accessLevel: true,
            },
          },
        },
      });

      if (
        !artifact ||
        !hasArtifactAccess(artifact, ctx.session?.userId, input.shareToken)
      ) {
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
