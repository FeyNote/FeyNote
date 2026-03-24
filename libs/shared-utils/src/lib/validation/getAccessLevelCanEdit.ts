import type { ArtifactAccessLevel } from '@prisma/client';

export const getAccessLevelCanEdit = (accessLevel: ArtifactAccessLevel) => {
  return accessLevel === 'coowner' || accessLevel === 'readwrite';
};
