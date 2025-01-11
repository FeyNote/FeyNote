import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { ArtifactCollectionDTO } from '@feynote/global-types';
import { artifactCollectionSummary } from '@feynote/prisma/types';

export const getArtifactCollections = authenticatedProcedure.query(
  async ({ ctx }): Promise<ArtifactCollectionDTO[]> => {
    const artifactCollectionShares =
      await prisma.artifactCollectionShare.findMany({
        where: {
          userId: ctx.session.userId,
        },
      });

    const artifactCollections = await prisma.artifactCollection.findMany({
      where: {
        id: {
          in: artifactCollectionShares.map(
            (artifactCollectionShare) =>
              artifactCollectionShare.artifactCollectionId,
          ),
        },
      },
      ...artifactCollectionSummary,
    });

    return artifactCollections;
  },
);
