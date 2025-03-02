import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';

export interface YArtifactMeta {
  id: string;
  userId: string;
  title: string;
  theme: ArtifactTheme;
  type: ArtifactType;
  titleBodyMerge: boolean;
  linkAccessLevel: ArtifactAccessLevel;
}

export interface UpdatableYArtifactMeta {
  title: string;
  theme: ArtifactTheme;
  type: ArtifactType;
  titleBodyMerge: boolean;
  linkAccessLevel: ArtifactAccessLevel;
}
