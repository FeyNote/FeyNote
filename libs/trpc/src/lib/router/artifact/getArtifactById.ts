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
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      ...artifactDetail,
    });

    const hasAccess =
      artifact &&
      (artifact?.userId === ctx.session.userId ||
        artifact.artifactShares.some(
          (share) => share.userId === ctx.session.userId,
        ));
    if (!hasAccess) {
      throw new TRPCError({
        message:
          'Artifact does not exist or is not visible to the current user',
        code: 'FORBIDDEN',
      });
    }

    return artifactDetailToArtifactDTO(ctx.session.userId, artifact);
  });
