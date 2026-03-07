import type { ArtifactAccessLevel } from '@prisma/client';

/**
 * This type must be kept relatively small as these are kept in RAM
 */
export interface WorkspaceMeta {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  linkAccessLevel: ArtifactAccessLevel;
  deletedAt: number | null;
  createdAt: number;
}

export interface UpdatableWorkspaceMeta {
  name: string;
  icon: string;
  color: string;
  linkAccessLevel: ArtifactAccessLevel;
  deletedAt: number | null;
}
