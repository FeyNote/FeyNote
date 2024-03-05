import { prisma } from '@dnd-assistant/prisma/client';
import { artifactSummary } from '@dnd-assistant/prisma/types';

export const getArtifactsByIds = async (artifactIds: string[]) => {
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
