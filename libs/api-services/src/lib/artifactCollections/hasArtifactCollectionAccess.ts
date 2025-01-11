import { ArtifactAccessLevel } from '@prisma/client';

type ArtifactInfoWithPermissions = {
  userId: string;
  artifactShares: {
    userId: string;
    accessLevel: ArtifactAccessLevel;
  }[];
  artifactShareTokens: {
    shareToken: string;
    accessLevel: ArtifactAccessLevel;
  }[];
};

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
