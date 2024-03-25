import { Prisma } from '@prisma/client';

export const artifactDetail = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    isPinned: true,
    userId: true,
    artifactTemplateId: true,
    createdAt: true,
    updatedAt: true,
    artifactFields: {
      select: {
        id: true,
        title: true,
        text: true,
        order: true,
        aiPrompt: true,
        description: true,
        placeholder: true,
        required: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        artifactImages: {
          select: {
            id: true,
            order: true,
            image: {
              select: {
                id: true,
                title: true,
                storageKey: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    },
  },
});

export type ArtifactDetail = Prisma.ArtifactGetPayload<typeof artifactDetail>;
