import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import type { ArtifactDetail } from '@feynote/prisma/types';

type ExpectedType = Omit<ArtifactDetail, 'text' | 'artifactPins'> & {
  isPinned: boolean;
  previewText: string;
};

export type ArtifactDTO = {
  id: string;
  title: string;
  type: ArtifactType;
  theme: ArtifactTheme;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  isPinned: boolean;
  previewText: string;
  artifactReferences: {
    id: string;
    artifactId: string;
    artifactBlockId: string;
    targetArtifactId: string;
    targetArtifactBlockId: string | null;
    referenceTargetArtifactId: string | null;
    targetArtifact: {
      title: string;
    } | null;
    referenceText: string;
    targetArtifactDate: string | null;
  }[];
  incomingArtifactReferences: {
    id: string;
    artifactId: string;
    artifact: {
      title: string;
    };
    artifactBlockId: string;
    targetArtifactId: string;
    targetArtifactBlockId: string | null;
    targetArtifactDate: string | null;
  }[];
  artfactFiles: {
    id: string;
    fileId: string;
    order: number;
    file: {
      filename: string;
      storageKey: string;
      mimetype: string;
    };
  }[];
  artifactShares: {
    id: string;
    userId: string;
    user: {
      name: string;
    };
    accessLevel: ArtifactAccessLevel;
  }[];
  artifactShareTokens: {
    id: string;
    shareToken: string;
    allowAddToAccount: boolean;
    accessLevel: ArtifactAccessLevel;
  }[];
  user: {
    name: string;
  };
};

// Check type inference between our static type and Prisma's dynamic type
const _ = {} as ArtifactDTO satisfies ExpectedType;
const __ = {} as ExpectedType satisfies ArtifactDTO;
