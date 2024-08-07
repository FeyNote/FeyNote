import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail, type ArtifactDetail } from '@feynote/prisma/types';

export const searchArtifactTitles = authenticatedProcedure
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
    const resultArtifactIds = await searchProvider.searchArtifactTitles(
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

    const results: ArtifactDetail[] = [];
    for (const resultArtifactId of resultArtifactIds) {
      if (results.length >= limit) break;

      const artifact = artifactsById.get(resultArtifactId);
      if (artifact) results.push(artifact as ArtifactDetail);
    }

    return results;
  });
