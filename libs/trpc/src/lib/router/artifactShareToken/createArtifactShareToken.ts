import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel } from '@prisma/client';
import { randomBytes } from 'crypto';

const SHARE_TOKEN_BYTES = 15;

export const createArtifactShareToken = authenticatedProcedure
  .input(
    z.object({
      artifactId: z.string(),
      allowAddToAccount: z.boolean(),
      accessLevel: z.nativeEnum(ArtifactAccessLevel),
      expiresAt: z.date().optional(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
    }> => {
      const artifact = await prisma.artifact.findUnique({
        where: {
          id: input.artifactId,
          userId: ctx.session.userId,
        },
        select: {
          id: true,
        },
      });

      if (!artifact) {
        throw new TRPCError({
          message: 'Artifact does not exist or is not owned by current user',
          code: 'FORBIDDEN',
        });
      }

      const artifactShare = await prisma.artifactShareToken.create({
        data: {
          artifactId: input.artifactId,
          accessLevel: input.accessLevel,
          shareToken: randomBytes(SHARE_TOKEN_BYTES).toString('hex'),
          expiresAt: input.expiresAt,
          allowAddToAccount: input.allowAddToAccount,
        },
        select: {
          id: true,
        },
      });

      return artifactShare;
    },
  );
