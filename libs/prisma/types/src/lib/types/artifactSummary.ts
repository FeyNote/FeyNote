import { Prisma } from '@prisma/client';

export const artifactSummary = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    isPinned: true,
    isTemplate: true,
    text: true,
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
    artfactFiles: {
      select: {
        id: true,
        fileId: true,
        order: true,
        file: {
          select: {
            filename: true,
            storageKey: true,
            mimetype: true,
          },
        },
      },
    },
  },
});

export type ArtifactSummary = Prisma.ArtifactGetPayload<typeof artifactSummary>;
