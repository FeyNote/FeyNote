import type { Prisma } from '@prisma/client';

export interface StandardizedImportInfo {
  imageFilesToUpload: (
    | {
        id: string;
        associatedArtifactId: string;
        path: string;
      }
    | {
        id: string;
        associatedArtifactId: string;
        url: string;
      }
  )[];
  artifactsToCreate: Prisma.ArtifactCreateManyInput[];
}
