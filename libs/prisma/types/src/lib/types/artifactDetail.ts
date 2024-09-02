import { Prisma } from '@prisma/client';

export const artifactDetail = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
    type: true,
    theme: true,
    isPinned: true,
    isTemplate: true,
    rootTemplateId: true,
    userId: true,
    createdAt: true,
    updatedAt: true,
    artifactTemplate: {
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    text: true,
    templatedArtifacts: {
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    artifactReferences: {
      select: {
        id: true,
        artifactId: true,
        artifactBlockId: true,
        targetArtifactId: true,
        targetArtifactBlockId: true,
        referenceTargetArtifactId: true,
        referenceText: true,
        targetArtifactDate: true,
      },
    },
    incomingArtifactReferences: {
      select: {
        id: true,
        artifactId: true,
        artifact: {
          select: {
            title: true,
          },
        },
        artifactBlockId: true,
        targetArtifactId: true,
        targetArtifactBlockId: true,
        targetArtifactDate: true,
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

export type ArtifactDetail = Prisma.ArtifactGetPayload<typeof artifactDetail>;
