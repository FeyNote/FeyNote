import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail, type ArtifactDetail } from '@feynote/prisma/types';
import {
  artifactDetailToArtifactDTO,
  hasArtifactAccess,
} from '@feynote/api-services';
import { publicProcedure } from '../../trpc';

export const getArtifactById = publicProcedure
  .input(
    z.object({
      id: z.string(),
      shareToken: z.string().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    if (!ctx.session && !input.shareToken) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
      });
    }

    const _artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      ...artifactDetail,
    });
    const artifact = _artifact as ArtifactDetail | undefined;

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

    return artifactDetailToArtifactDTO(ctx.session?.userId, artifact);
  });
