import type { ArtifactAccessLevel } from '@prisma/client';

/**
 * This object serves just to have a failing typecheck here if a new access level is ever added.
 */
const artifactAccessLevels = {
  noaccess: '',
  readonly: '',
  readwrite: '',
  coowner: '',
} satisfies Record<ArtifactAccessLevel, ''>;

export const ARTIFACT_ACCESS_LEVELS_RANKED = Object.keys(
  artifactAccessLevels,
) as ArtifactAccessLevel[];
