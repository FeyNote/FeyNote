import type { ArtifactCollectionSummary } from '@feynote/prisma/types';

export type ArtifactCollectionDTO = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// Check type inference between our static type and Prisma's dynamic type
const _ = {} as ArtifactCollectionDTO satisfies ArtifactCollectionSummary;
const __ = {} as ArtifactCollectionSummary satisfies ArtifactCollectionDTO;
