import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail, type ArtifactDetail } from '@feynote/prisma/types';
import { artifactDetailToArtifactDTO } from '@feynote/api-services';

export const getArtifacts = authenticatedProcedure
  .input(
    z.object({
      isTemplate: z.boolean().optional(),
      isPinned: z.boolean().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const { session } = ctx;

    const artifacts = await prisma.artifact.findMany({
      where: {
        userId: session.userId,
        isTemplate: input.isTemplate,
        isPinned: input.isPinned,
      },
      ...artifactDetail,
    });

    const results = [];
    for (const artifact of artifacts) {
      results.push(artifactDetailToArtifactDTO(artifact as ArtifactDetail));
    }

    return results;
  });
