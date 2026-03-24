import type { ArtifactAccessLevel } from '@prisma/client';

export interface YWorkspaceMeta {
  id: string;
  userId: string;
  name: string;
  icon: string;
  color: string;
  linkAccessLevel: ArtifactAccessLevel;
  createdAt: number;
  deletedAt: number | null;
}
