import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';
import { ArtifactDTO } from '@feynote/global-types';
import { artifactDetailToArtifactDTO } from '@feynote/api-services';

/**
 * @deprecated Please use ArtifactSnapshots rather than ArtifactDTOs
 */
export const getArtifacts = authenticatedProcedure.query(
  async ({ ctx }): Promise<ArtifactDTO[]> => {
    const [ownedArtifacts, sharedArtifacts] = await Promise.all([
      prisma.artifact.findMany({
        where: {
          userId: ctx.session.userId,
        },
        ...artifactDetail,
      }),
      prisma.artifact.findMany({
        where: {
          artifactShares: {
            some: {
              userId: ctx.session.userId,
            },
          },
        },
        ...artifactDetail,
      }),
    ]);

    const artifacts = [...ownedArtifacts, ...sharedArtifacts];

    const results = new Map<string, ArtifactDTO>();
    for (const artifact of artifacts) {
      const dto = artifactDetailToArtifactDTO(ctx.session.userId, artifact);
      results.set(dto.id, dto);
    }

    return [...results.values()];
  },
);
