import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { artifactDetail, type ArtifactDTO } from '@feynote/prisma/types';
import { prisma } from '@feynote/prisma/client';
import { artifactDetailToArtifactDTO } from '@feynote/api-services';

export const searchArtifacts = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).optional(),
      isTemplate: z.boolean().optional(),
      isPinned: z.boolean().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const limit = input.limit || 100;
    const resultArtifactIds = await searchProvider.searchArtifacts(
      ctx.session.userId,
      input.query,
    );

    const artifacts = await prisma.artifact.findMany({
      where: {
        id: { in: resultArtifactIds },
        isTemplate: input.isTemplate,
        isPinned: input.isPinned,
      },
      ...artifactDetail,
    });
    const artifactsById = new Map(
      artifacts.map((artifact) => [artifact.id, artifact]),
    );

    const results: ArtifactDTO[] = [];
    for (const resultArtifactId of resultArtifactIds) {
      if (results.length >= limit) break;

      const artifact = artifactsById.get(resultArtifactId);
      if (artifact) {
        results.push(artifactDetailToArtifactDTO(artifact));
      }
    }

    return results;
  });
