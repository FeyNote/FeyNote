import { searchProvider } from '@feynote/search';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { ArtifactDetail, artifactDetail } from '@feynote/prisma/types';
import {
  BlocksByStringQueryResult,
  getBlocksByQuery,
} from '@feynote/shared-utils';

export interface ArtifactBlockResult extends BlocksByStringQueryResult {
  artifactId: string;
}

export const searchArtifactBlocks = authenticatedProcedure
  .input(
    z.object({
      query: z.string(),
    }),
  )
  .query(async ({ input, ctx }) => {
    const matchedArtifactIds = await searchProvider.searchArtifacts(
      ctx.session.userId,
      input.query,
      false,
    );
    const artifacts = (await prisma.artifact.findMany({
      where: {
        id: { in: matchedArtifactIds },
      },
      ...artifactDetail,
      orderBy: [
        {
          title: 'desc',
        },
      ],
    })) as ArtifactDetail[];

    const artifactBlockResults: ArtifactBlockResult[] = [];

    for (const artifact of artifacts) {
      // We do not want to break loading if an artifact is malformed.
      try {
        const json = artifact.json;
        if (!json || !json.blocknoteContent) continue;

        const results = getBlocksByQuery(input.query, json.blocknoteContent);

        for (const result of results) {
          artifactBlockResults.push({
            ...result,
            artifactId: artifact.id,
          });
        }
      } catch (e) {
        // TODO: Use Sentry here
        console.log(`Error while parsing artifact ${artifact.id}`);
      }
    }

    return artifactBlockResults;
  });
