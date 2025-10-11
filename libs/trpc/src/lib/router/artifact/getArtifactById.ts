import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { ArtifactDTO } from '@feynote/global-types';
import {
  artifactDetailToArtifactDTO,
  hasArtifactAccess,
} from '@feynote/api-services';
import { publicProcedure } from '../../trpc';

/**
 * @deprecated Please use ArtifactSnapshots rather than ArtifactDTOs
 */
export const getArtifactById = publicProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }): Promise<ArtifactDTO> => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      ...artifactDetail,
    });

    if (!artifact || !hasArtifactAccess(artifact, ctx.session?.userId)) {
      throw new TRPCError({
        message:
          'Artifact does not exist or is not visible to the current user',
        code: 'NOT_FOUND',
      });
    }

    return artifactDetailToArtifactDTO(ctx.session?.userId, artifact);
  });
