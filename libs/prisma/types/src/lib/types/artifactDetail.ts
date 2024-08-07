import { Prisma } from '@prisma/client';
import { ArtifactJson } from './artifactJson';

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
    json: true,
    yBin: true,
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

type _ArtifactDetail = Prisma.ArtifactGetPayload<typeof artifactDetail>;

export type ArtifactDetail = Omit<_ArtifactDetail, 'json'> & {
  json: ArtifactJson;
};
