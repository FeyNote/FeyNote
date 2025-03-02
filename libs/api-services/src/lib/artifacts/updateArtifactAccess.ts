import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel, Prisma } from '@prisma/client';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { YArtifactUserAccess } from '@feynote/global-types';

/**
 * Create/delete all user shares for this artifact
 * to match the ykeyvalue provided.
 */
export async function updateArtifactAccess({
  artifactId,
  oldYUserAccess,
  newYUserAccess,
  oldLinkAccessLevel,
  newLinkAccessLevel,
  tx = prisma,
}: {
  artifactId: string;
  oldYUserAccess: YKeyValue<YArtifactUserAccess>;
  newYUserAccess: YKeyValue<YArtifactUserAccess>;
  oldLinkAccessLevel: ArtifactAccessLevel;
  newLinkAccessLevel: ArtifactAccessLevel;
  tx: Prisma.TransactionClient;
}): Promise<void> {
  const oldUserAccess = oldYUserAccess.yarray
    .map(({ key, val }) => `${key}:${val.accessLevel}`)
    .sort()
    .join(',');
  const newUserAccess = newYUserAccess.yarray
    .map(({ key, val }) => `${key}:${val.accessLevel}`)
    .sort()
    .join(',');

  if (oldUserAccess !== newUserAccess) {
    await tx.artifactShare.deleteMany({
      where: {
        artifactId,
      },
    });

    await tx.artifactShare.createMany({
      data: newYUserAccess.yarray.map(({ key, val }) => ({
        artifactId,
        userId: key,
        accessLevel: val.accessLevel,
      })),
    });
  }

  if (oldLinkAccessLevel !== newLinkAccessLevel) {
    await tx.artifact.update({
      where: {
        id: artifactId,
      },
      data: {
        linkAccessLevel: newLinkAccessLevel || ArtifactAccessLevel.noaccess,
      },
    });
  }
}
