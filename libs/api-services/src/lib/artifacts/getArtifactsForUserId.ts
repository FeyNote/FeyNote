import { prisma } from '@feynote/prisma/client';
import { artifactSummary } from '@feynote/prisma/types';

export const getArtifactsForUserId = async (userId: string) => {
  const artifacts = await prisma.artifact.findMany({
    where: {
      userId,
    },
    ...artifactSummary,
    orderBy: [
      {
        title: 'desc',
      },
    ],
  });
  return artifacts;
};
