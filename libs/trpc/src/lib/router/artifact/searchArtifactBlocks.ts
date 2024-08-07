import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail, type ArtifactDetail } from '@feynote/prisma/types';

export const searchArtifactBlocks = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
      limit: z.number().min(1).max(100).optional(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const matchedArtifactBlocks = await searchProvider.searchArtifactBlocks(
      ctx.session.userId,
      input.query,
      {
        prefix: true,
      },
    );

    const matchedArtifactIds = [
      ...new Set(
        matchedArtifactBlocks.map((artifactBlock) => artifactBlock.artifactId),
      ),
    ];

    const artifacts = await prisma.artifact.findMany({
      where: {
        id: {
          in: matchedArtifactIds,
        },
      },
      ...artifactDetail,
      take: input.limit || 100,
    });

    const artifactsById = artifacts.reduce(
      (artifactsById, artifact) => {
        artifactsById[artifact.id] = artifact as ArtifactDetail;
        return artifactsById;
      },
      {} as Record<string, ArtifactDetail>,
    );

    const results = matchedArtifactBlocks
      .map((matchedArtifactBlock) => ({
        ...matchedArtifactBlock,
        artifact: artifactsById[matchedArtifactBlock.artifactId],
      }))
      .filter((matchedArtifactBlock) => !!matchedArtifactBlock.artifact);

    return results;
  });
