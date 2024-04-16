import { prisma } from '@feynote/prisma/client';
import { artifactSummary } from '@feynote/prisma/types';

export const getArtifactSummariesByIds = async (artifactIds: string[]) => {
  const artifacts = await prisma.artifact.findMany({
    where: {
      id: { in: artifactIds },
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
