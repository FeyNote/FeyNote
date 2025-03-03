import { ArtifactAccessLevel } from '@prisma/client';

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
): ArtifactAccessLevel => {
  if (artifactSharingInfo.userId === userId) {
    return 'coowner';
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

  return 'noaccess';
};
