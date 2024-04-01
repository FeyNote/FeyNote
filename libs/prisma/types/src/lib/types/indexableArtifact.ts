import { Prisma } from '@prisma/client';

export const indexableArtifact = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    userId: true,
    text: true,
  },
});

export type IndexableArtifact = Prisma.ArtifactGetPayload<
  typeof indexableArtifact
>;
