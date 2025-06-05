import { Prisma } from '@prisma/client';

export const artifactWithReferences =
  Prisma.validator<Prisma.ArtifactFindFirstArgs>()({
    select: {
      id: true,
      yBin: true,
      artifactReferences: {
        select: {
          targetArtifactId: true,
          targetArtifactBlockId: true,
          referenceText: true,
        },
      },
    },
  });

export type ArtifactWithReferences = Prisma.ArtifactGetPayload<
  typeof artifactWithReferences
>;
