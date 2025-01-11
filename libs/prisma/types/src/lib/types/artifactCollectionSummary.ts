import { Prisma } from '@prisma/client';

export const artifactCollectionSummary =
  Prisma.validator<Prisma.ArtifactCollectionFindFirstArgs>()({
    select: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
  });

export type ArtifactCollectionSummary = Prisma.ArtifactCollectionGetPayload<
  typeof artifactCollectionSummary
>;
