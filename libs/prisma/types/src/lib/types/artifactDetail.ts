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

// An apology to the future reader's eyes, for this is necessary until https://github.com/prisma/prisma/issues/3219 is resolved
type ArtifactDetailReferencedArtifact = Omit<
  _ArtifactDetail['referencedArtifacts'][0],
  'referencedArtifact'
> & {
  referencedArtifact: Omit<
    _ArtifactDetail['referencedArtifacts'][0]['referencedArtifact'],
    'json'
  > & {
    json: ArtifactJson;
  };
};
type ArtifactDetailReferencedFromArtifact = Omit<
  _ArtifactDetail['referencedArtifacts'][0],
  'artifact'
> & {
  artifact: Omit<
    _ArtifactDetail['referencedArtifacts'][0]['referencedArtifact'],
    'json'
  > & {
    json: ArtifactJson;
  };
};

export type ArtifactDetail = Omit<
  _ArtifactDetail,
  'json' | 'referencedArtifacts' | 'referencedFromArtifacts'
> & {
  json: ArtifactJson;
  referencedArtifacts: ArtifactDetailReferencedArtifact[];
  referencedFromArtifacts: ArtifactDetailReferencedFromArtifact[];
};
