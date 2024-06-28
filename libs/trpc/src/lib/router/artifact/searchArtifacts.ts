import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { ArtifactSummary, artifactSummary } from '@feynote/prisma/types';
import { prisma } from '@feynote/prisma/client';

export const searchArtifacts = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).optional(),
      withEmbeddings: z.boolean().optional(),
      isTemplate: z.boolean().optional(),
      isPinned: z.boolean().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const limit = input.limit || 100;
    const resultArtifactIds = await searchProvider.searchArtifacts(
      ctx.session.userId,
      input.query,
      input.withEmbeddings ?? true,
    );

    const artifacts = await prisma.artifact.findMany({
      where: {
        id: { in: resultArtifactIds },
        isTemplate: input.isTemplate,
        isPinned: input.isPinned,
      },
      ...artifactSummary,
    });
    const artifactsById = new Map(
      artifacts.map((artifact) => [artifact.id, artifact]),
    );

    const results: ArtifactSummary[] = [];
    for (const resultArtifactId of resultArtifactIds) {
      if (results.length >= limit) break;

      const artifact = artifactsById.get(resultArtifactId);
      if (artifact) results.push(artifact);
    }

    return results;
  });
