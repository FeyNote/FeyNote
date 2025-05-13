import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { artifactDetail } from '@feynote/prisma/types';
import { ArtifactDTO } from '@feynote/global-types';
import { prisma } from '@feynote/prisma/client';
import { artifactDetailToArtifactDTO } from '@feynote/api-services';

export const searchArtifacts = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).optional(),
    }),
  )
  .query(
    async ({
      input,
      ctx,
    }): Promise<
      {
        artifact: ArtifactDTO;
        highlight?: string;
      }[]
    > => {
      const searchResults = await searchProvider.searchArtifacts(
        ctx.session.userId,
        input.query,
        {
          prefix: true,
          limit: input.limit || 50,
        },
      );
      const searchResultArtifactIds = searchResults.map(
        (result) => result.document.id,
      );

      const artifacts = await prisma.artifact.findMany({
        where: {
          id: { in: searchResultArtifactIds },
        },
        ...artifactDetail,
      });
      const artifactsById = new Map(
        artifacts.map((artifact) => [artifact.id, artifact]),
      );

      const results: {
        artifact: ArtifactDTO;
        highlight?: string;
      }[] = [];
      for (const searchResult of searchResults) {
        const artifact = artifactsById.get(searchResult.document.id);
        if (artifact) {
          results.push({
            artifact: artifactDetailToArtifactDTO(ctx.session.userId, artifact),
            highlight: searchResult.highlight,
          });
        }
      }

      return results;
    },
  );
