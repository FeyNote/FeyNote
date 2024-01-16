import { artifactSummary, prisma } from '@dnd-assistant/prisma';

export const getAllByUserId = async (userId: string) => {
  const artifacts = await prisma.artifact.findMany({
    where: {
      userId,
    },
    ...artifactSummary,
  });
  return artifacts;
};
