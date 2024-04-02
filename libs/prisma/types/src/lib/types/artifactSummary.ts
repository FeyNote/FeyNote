import { Prisma } from '@prisma/client';

export const artifactSummary = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    isPinned: true,
    isTemplate: true,
    isRootTemplate: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    artifactTemplate: {
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
      },
    },
  },
});

export type ArtifactSummary = Prisma.ArtifactGetPayload<typeof artifactSummary>;
