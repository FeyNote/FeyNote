import { prisma } from '@feynote/prisma/client';
import { ArtifactAccessLevel } from '@prisma/client';

type ArtifactInfoWithPermissions = {
  id: string;
  userId: string;
  artifactCollectionId: string | null;
  linkAccessLevel: ArtifactAccessLevel;
};

const accessLevelRanking = [
  ArtifactAccessLevel.noaccess,
  ArtifactAccessLevel.readonly,
  ArtifactAccessLevel.readwrite,
  ArtifactAccessLevel.coowner,
];

const accessLevelMax = (
  a: ArtifactAccessLevel | undefined | null,
  b: ArtifactAccessLevel | undefined | null,
): ArtifactAccessLevel => {
  if (a === undefined || a === null) {
    return b || ArtifactAccessLevel.noaccess;
  }
  if (b === undefined || b === null) {
    return a || ArtifactAccessLevel.noaccess;
  }
  return accessLevelRanking[
    Math.max(accessLevelRanking.indexOf(a), accessLevelRanking.indexOf(b))
  ];
};

export const getArtifactAccessLevel = async (args: {
  artifact: string | ArtifactInfoWithPermissions;
  currentUserId: string | undefined;
}): Promise<ArtifactAccessLevel> => {
  const artifactP =
    typeof args.artifact === 'string'
      ? prisma.artifact.findUnique({
          where: {
            id: args.artifact,
          },
          select: {
            id: true,
            userId: true,
            artifactCollectionId: true,
            linkAccessLevel: true,
          },
        })
      : Promise.resolve(args.artifact);

  const artifact = await artifactP;

  if (!artifact) {
    return ArtifactAccessLevel.noaccess;
  }

  let highestAccessLevel = artifact.linkAccessLevel;
  if (!args.currentUserId) return highestAccessLevel;

  if (artifact.artifactCollectionId) {
    const collectionShare = await prisma.artifactCollectionShare.findFirst({
      where: {
        artifactCollectionId: artifact.artifactCollectionId,
        userId: args.currentUserId,
      },
      select: {
        computedAccessLevels: true,
      },
    });

    const computedAccessLevels =
      collectionShare?.computedAccessLevels as Record<
        string,
        ArtifactAccessLevel
      >;
    highestAccessLevel = accessLevelMax(
      highestAccessLevel,
      computedAccessLevels[artifact.id],
    );
  } else if (artifact.userId === args.currentUserId) {
    // User only owns their own artifact if it's not in a collection
    highestAccessLevel = accessLevelMax(
      highestAccessLevel,
      ArtifactAccessLevel.coowner,
    );
  }

  return highestAccessLevel;
};
