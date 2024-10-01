import type { ArtifactTheme, ArtifactType } from '@prisma/client';

export interface YArtifactMetaSchema {
  title: string;
  theme: ArtifactTheme;
  type: ArtifactType;
  titleBodyMerge: boolean;
}
