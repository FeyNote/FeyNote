import { getArtifactSummariesByIds } from '@feynote/api-services';
import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { artifactSummary } from '@feynote/prisma/types';
import { prisma } from '@feynote/prisma/client';

export const searchArtifacts = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
      isTemplate: z.boolean().optional(),
      isPinned: z.boolean().optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const searchedArtifactIds = await searchProvider.searchArtifacts(
      ctx.session.userId,
      input.query,
      true,
    );

    const artifacts = await prisma.artifact.findMany({
      where: {
        id: { in: searchedArtifactIds },
        isTemplate: input.isTemplate,
        isPinned: input.isPinned,
      },
      ...artifactSummary,
      orderBy: [
        {
          title: 'desc',
        },
      ],
    });

    return artifacts;
  });
