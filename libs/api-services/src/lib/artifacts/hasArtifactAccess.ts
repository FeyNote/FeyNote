import { ArtifactAccessLevel } from '@prisma/client';

type ArtifactInfoWithPermissions = {
  userId: string;
  artifactShares: {
    userId: string;
    accessLevel: ArtifactAccessLevel;
  }[];
  linkAccessLevel: ArtifactAccessLevel | null;
};

export const hasArtifactAccess = (
  artifact: ArtifactInfoWithPermissions,
  userId?: string,
) => {
  const isOwner = artifact.userId === userId;
  const isSharedTo = artifact.artifactShares.some(
    (share) => share.userId === userId,
  );
  const isPubliclyAccessible =
    artifact.linkAccessLevel === ArtifactAccessLevel.readonly ||
    artifact.linkAccessLevel === ArtifactAccessLevel.readwrite ||
    artifact.linkAccessLevel === ArtifactAccessLevel.coowner;

  const hasAccess = isOwner || isSharedTo || isPubliclyAccessible;

  return hasAccess;
};
