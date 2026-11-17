import { prisma } from '@feynote/prisma/client';
import { getArtifactAccessLevel } from '@feynote/shared-utils';

export const getUserCanReadAllArtifacts = async (
  userId: string,
  artifactIds: string[],
): Promise<boolean> => {
  const artifacts = await prisma.artifact.findMany({
    where: { id: { in: artifactIds }, deletedAt: null },
    select: {
      userId: true,
      linkAccessLevel: true,
      artifactShares: {
        select: {
          userId: true,
          accessLevel: true,
        },
      },
    },
  });

  if (artifacts.length !== artifactIds.length) return false;

  return artifacts.every(
    (artifact) => getArtifactAccessLevel(artifact, userId) !== 'noaccess',
  );
};
