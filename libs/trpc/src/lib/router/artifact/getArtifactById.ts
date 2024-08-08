import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { artifactDetailToArtifactDTO } from '@feynote/api-services';

export const getArtifactById = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const artifact = await prisma.artifact.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      ...artifactDetail,
    });

    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        message: 'Artifact not visible to current user',
        code: 'FORBIDDEN',
      });
    }

    return artifactDetailToArtifactDTO(artifact);
  });
