import { ArtifactTheme } from '@prisma/client';

export interface YArtifactMetaSchema {
  title: string;
  theme: ArtifactTheme;
  isPinned: boolean;
  isTemplate: boolean;
}
