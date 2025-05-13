import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { ArtifactDTO } from '@feynote/global-types';
import { artifactDetailToArtifactDTO } from '@feynote/api-services';

export const searchArtifactBlocks = authenticatedProcedure
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
        blockId: string;
        blockText: string;
        highlight?: string;
      }[]
    > => {
      const searchResults = await searchProvider.searchArtifactBlocks(
        ctx.session.userId,
        input.query,
        {
          prefix: true,
          limit: input.limit,
        },
      );

      const matchedArtifactIds = [
        ...new Set(
          searchResults.map(
            (artifactBlock) => artifactBlock.document.artifactId,
          ),
        ),
      ];

      const artifacts = await prisma.artifact.findMany({
        where: {
          id: {
            in: matchedArtifactIds,
          },
        },
        ...artifactDetail,
      });
      const artifactsById = new Map(
        artifacts.map((artifact) => [artifact.id, artifact]),
      );

      const results: {
        artifact: ArtifactDTO;
        blockId: string;
        blockText: string;
        highlight?: string;
      }[] = [];
      for (const searchResult of searchResults) {
        const artifact = artifactsById.get(searchResult.document.artifactId);
        if (artifact) {
          results.push({
            artifact: artifactDetailToArtifactDTO(ctx.session.userId, artifact),
            blockId: searchResult.document.id,
            blockText: searchResult.document.text,
            highlight: searchResult.highlight,
          });
        }
      }

      return results;
    },
  );
