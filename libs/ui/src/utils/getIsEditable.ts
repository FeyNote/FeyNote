import type { ArtifactDTO } from '@feynote/global-types';

export const getIsEditable = (artifact: ArtifactDTO, userId: string) => {
  const isEditable = artifact.userId === userId; //||
  //artifact.artifactShares.some(
  //  (share) => share.userId === userId && share.accessLevel === 'readwrite',
  //);

  return isEditable;
};
