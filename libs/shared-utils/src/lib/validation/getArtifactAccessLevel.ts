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
    linkAccessLevel: ArtifactAccessLevel | null;
  },
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

  if (artifactSharingInfo.linkAccessLevel) {
    return artifactSharingInfo.linkAccessLevel;
  }

  return 'none';
};
