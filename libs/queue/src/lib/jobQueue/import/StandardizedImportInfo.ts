import type { Prisma } from '@prisma/client';

export interface StandardizedImportInfo {
  mediaFilesToUpload: (
    | {
        id: string;
        associatedArtifactId: string;
        path: string;
        storageKey: string;
      }
    | {
        id: string;
        associatedArtifactId: string;
        url: string;
        storageKey: string;
      }
  )[];
  artifactsToCreate: Prisma.ArtifactCreateManyInput[];
}
