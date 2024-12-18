import { ArtifactAccessLevel } from '@prisma/client';

export type NegotiatedArtifactAccessLevel =
  | 'owner'
  | 'coowner'
  | 'readwrite'
  | 'readonly'
  | 'none';

export const getArtifactAccessLevel = (
  artifactSharingInfo: {
    userId: string;
    artifactShares: {
      userId: string;
      accessLevel: ArtifactAccessLevel;
    }[];
    artifactShareTokens: {
      shareToken: string;
      accessLevel: ArtifactAccessLevel;
    }[];
  },
  shareToken: string | undefined,
  userId: string | undefined,
): NegotiatedArtifactAccessLevel => {
  if (artifactSharingInfo.userId === userId) {
    return 'owner';
  }

  const artifactShare = artifactSharingInfo.artifactShares.find(
    (share) => share.userId === userId,
  );
  if (artifactShare) {
    return artifactShare.accessLevel;
  }

  const artifactShareToken = artifactSharingInfo.artifactShareTokens.find(
    (share) => share.shareToken === shareToken,
  );
  if (artifactShareToken) {
    return artifactShareToken.accessLevel;
  }

  return 'none';
};
