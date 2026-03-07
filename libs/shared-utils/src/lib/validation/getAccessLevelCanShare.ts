import type { ArtifactAccessLevel } from '@prisma/client';

export const getAccessLevelCanShare = (accessLevel: ArtifactAccessLevel) => {
  return accessLevel === 'coowner';
};
