import { Prisma } from '@prisma/client';
import { ArtifactJson } from './artifactJson';

export const artifactDetail = Prisma.validator<Prisma.ArtifactArgs>()({
  select: {
    id: true,
    title: true,
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
    templatedArtifacts: {
      select: {
        id: true,
        title: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    },
    referencedArtifacts: {
      select: {
        id: true,
        artifactId: true,
        referencedArtifact: {
          select: {
            title: true,
            json: true,
          },
        },
      },
    },
    referencedFromArtifacts: {
      select: {
        id: true,
        artifactId: true,
        artifact: {
          select: {
            title: true,
            json: true,
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
