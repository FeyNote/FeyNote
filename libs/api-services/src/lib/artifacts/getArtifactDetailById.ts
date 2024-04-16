import { prisma } from '@feynote/prisma/client';
import { ArtifactDetail, artifactDetail } from '@feynote/prisma/types';

export const getArtifactDetailById = async (id: string) => {
  const artifact = await prisma.artifact.findUniqueOrThrow({
    where: {
      id,
    },
    ...artifactDetail,
  });
  return artifact as ArtifactDetail;
};
