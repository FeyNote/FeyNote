import { prisma } from '@feynote/prisma/client';
import { artifactDetail } from '@feynote/prisma/types';

export const getArtifactsForUserId = async (userId: string) => {
  const artifacts = await prisma.artifact.findMany({
    where: {
      userId,
    },
    ...artifactDetail,
    orderBy: [
      {
        title: 'desc',
      },
    ],
  });
  return artifacts;
};
