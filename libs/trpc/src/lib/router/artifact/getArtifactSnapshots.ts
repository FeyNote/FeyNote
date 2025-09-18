import type { ArtifactSnapshot } from '@feynote/global-types';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { artifactSnapshot } from '@feynote/prisma/types';
import { ArtifactAccessLevel } from '@prisma/client';
import { prismaArtifactSnapshotToArtifactSnapshot } from '@feynote/api-services';

const includedAccessLevels = [
  ArtifactAccessLevel.coowner,
  ArtifactAccessLevel.readwrite,
  ArtifactAccessLevel.readonly,
];

export const getArtifactSnapshots = authenticatedProcedure.query(
  async ({ ctx }): Promise<ArtifactSnapshot[]> => {
    const [ownedArtifacts, sharedArtifacts] = await Promise.all([
      prisma.artifact.findMany({
        where: {
          userId: ctx.session.userId,
        },
        ...artifactSnapshot,
      }),
      prisma.artifact.findMany({
        where: {
          artifactShares: {
            some: {
              OR: includedAccessLevels.map((el) => ({
                userId: ctx.session.userId,
                accessLevel: el,
              })),
            },
          },
        },
        ...artifactSnapshot,
      }),
    ]);

    const artifacts = [...ownedArtifacts, ...sharedArtifacts];

    const results = new Map<string, ArtifactSnapshot>();
    for (const artifact of artifacts) {
      results.set(
        artifact.id,
        prismaArtifactSnapshotToArtifactSnapshot(artifact),
      );
    }
    ctx.res.header('x-no-date-encode', 'true');

    return [...results.values()];
  },
);
