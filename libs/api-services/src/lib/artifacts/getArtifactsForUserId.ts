import { artifactSummary, prisma } from '@dnd-assistant/prisma';

export const getArtifactsForUserId = async (userId: string) => {
  const artifacts = await prisma.artifact.findMany({
    where: {
      userId,
    },
    ...artifactSummary,
  });
  return artifacts;
};
