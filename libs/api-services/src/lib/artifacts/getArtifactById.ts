import { artifactDetail, prisma } from '@dnd-assistant/prisma';

export const getArtifactById = async (id: string) => {
  const artifact = await prisma.artifact.findUniqueOrThrow({
    where: {
      id,
    },
    ...artifactDetail,
  });
  return artifact;
};
