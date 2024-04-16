import { prisma } from '@dnd-assistant/prisma/client';
import { ArtifactDetail, artifactDetail } from '@dnd-assistant/prisma/types';

export const getArtifactDetailById = async (id: string) => {
  const artifact = await prisma.artifact.findUniqueOrThrow({
    where: {
      id,
    },
    ...artifactDetail,
  });
  return artifact as ArtifactDetail;
};
