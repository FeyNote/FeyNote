import type { ArtifactTheme, ArtifactType } from '@prisma/client';
import type { ArtifactDetail } from '@feynote/prisma/types';

type ExpectedType = Omit<ArtifactDetail, 'text'> & {
  previewText: string;
};

export type ArtifactDTO = {
  id: string;
  title: string;
  type: ArtifactType;
  theme: ArtifactTheme;
  artifactCollectionId: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  previewText: string;
  artifactReferences: {
    artifactId: string;
    artifactBlockId: string;
    targetArtifactId: string;
    referenceTargetArtifactId: string | null;
    targetArtifactBlockId: string | null;
    targetArtifactDate: string | null;
    referenceText: string;
    artifact: {
      title: string;
    };
  }[];
  incomingArtifactReferences: {
    artifactId: string;
    artifactBlockId: string;
    targetArtifactId: string;
    referenceTargetArtifactId: string | null;
    targetArtifactBlockId: string | null;
    targetArtifactDate: string | null;
    referenceText: string;
    artifact: {
      title: string;
    };
  }[];
  files: {
    id: string;
    name: string;
    storageKey: string;
    mimetype: string;
  }[];
  user: {
    name: string;
  };
};

// Check type inference between our static type and Prisma's dynamic type
const _ = {} as ArtifactDTO satisfies ExpectedType;
const __ = {} as ExpectedType satisfies ArtifactDTO;
