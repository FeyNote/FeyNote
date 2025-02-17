import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';

export interface YArtifactMeta {
  title: string;
  theme: ArtifactTheme;
  type: ArtifactType;
  titleBodyMerge: boolean;
  linkAccessLevel: ArtifactAccessLevel | 'noaccess';
}
