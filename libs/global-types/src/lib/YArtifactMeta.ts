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
  linkAccessLevel: ArtifactAccessLevel;
  createdAt: number;
  deletedAt: number | null;
}

export interface UpdatableYArtifactMeta {
  title: string;
  theme: ArtifactTheme;
  type: ArtifactType;
  linkAccessLevel: ArtifactAccessLevel;
  deletedAt: number | null;
}
