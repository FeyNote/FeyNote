import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { ArtifactDTO } from '@feynote/global-types';
import { artifactDetailToArtifactDTO } from '@feynote/api-services';
import type { BlockIndexDocument } from '@feynote/search';

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
      (BlockIndexDocument & {
        artifact: ArtifactDTO;
      })[]
    > => {
      const matchedArtifactBlocks = await searchProvider.searchArtifactBlocks(
        ctx.session.userId,
        input.query,
        {
          prefix: true,
          limit: input.limit,
        },
      );

      const matchedArtifactIds = [
        ...new Set(
          matchedArtifactBlocks.map(
            (artifactBlock) => artifactBlock.artifactId,
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

      const artifactsById = artifacts.reduce<Record<string, ArtifactDTO>>(
        (artifactsById, artifact) => {
          artifactsById[artifact.id] = artifactDetailToArtifactDTO(
            ctx.session.userId,
            artifact,
          );
          return artifactsById;
        },
        {},
      );

      const results = matchedArtifactBlocks
        .map((matchedArtifactBlock) => ({
          ...matchedArtifactBlock,
          artifact: artifactsById[matchedArtifactBlock.artifactId],
        }))
        .filter((matchedArtifactBlock) => !!matchedArtifactBlock.artifact);

      return results;
    },
  );
