import { Prisma } from '@prisma/client';

export const artifactDetail = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    isPinned: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    artifactTemplate: {
      select: {
        id: true,
        title: true,
        userId: true,
        visibility: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    fields: {
      select: {
        id: true,
        text: true,
        fieldImages: {
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
        fieldTemplateId: true,
        fieldTemplate: {
          select: {
            id: true,
            title: true,
            order: true,
            aiPrompt: true,
            type: true,
            description: true,
            placeholder: true,
            required: true,
            artifactTemplateId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    },
  },
});

export type ArtifactDetail = Prisma.ArtifactGetPayload<typeof artifactDetail>;
