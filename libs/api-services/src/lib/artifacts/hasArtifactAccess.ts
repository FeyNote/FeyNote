import type { ArtifactDetail } from '@feynote/prisma/types';

type ArtifactInfoWithPermissions = Pick<
  ArtifactDetail,
  'userId' | 'artifactShares' | 'artifactShareTokens'
>;

export const hasArtifactAccess = (
  artifact: ArtifactInfoWithPermissions,
  userId?: string,
  shareToken?: string,
) => {
  const isOwner = artifact.userId === userId;
  const isSharedTo = artifact.artifactShares.some(
    (share) => share.userId === userId,
  );
  const shareTokenValid = artifact.artifactShareTokens.some(
    (token) => token.shareToken === shareToken,
  );
  const hasAccess = isOwner || isSharedTo || shareTokenValid;

  return hasAccess;
};
