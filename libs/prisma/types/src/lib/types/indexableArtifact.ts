import { Prisma } from '@prisma/client';

export const indexableArtifact = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    userId: true,
    artifactFields: {
      select: {
        text: true,
        title: true,
        artifactImages: {
          select: {
            image: {
              select: {
                title: true,
              },
            },
          },
        },
      },
    },
  },
});

export type IndexableArtifact = Prisma.ArtifactGetPayload<
  typeof indexableArtifact
>;
