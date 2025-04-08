import { Prisma } from '@prisma/client';

export const artifactReferenceSummary =
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

export type ArtifactReferenceSummary = Prisma.ArtifactGetPayload<
  typeof artifactReferenceSummary
>;
