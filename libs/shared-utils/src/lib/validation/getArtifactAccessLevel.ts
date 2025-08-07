import type { ArtifactAccessLevel } from '@prisma/client';
import { Doc as YDoc } from 'yjs';
import { getMetaFromYArtifact } from '../yjs/getMetaFromYArtifact';
import { getUserAccessFromYArtifact } from '../yjs/getUserAccessFromYArtifact';

/**
 * Can be passed either a YDoc or server-side artifact sharing info structure.
 * Returns access level for a given userId to that artifact
 */
export const getArtifactAccessLevel = (
  _artifactInfo:
    | {
        userId: string;
        artifactShares: {
          userId: string;
          accessLevel: ArtifactAccessLevel;
        }[];
        linkAccessLevel: ArtifactAccessLevel | null;
      }
    | YDoc,
  userId: string | undefined,
): ArtifactAccessLevel => {
  const artifactInfo =
    _artifactInfo instanceof YDoc
      ? {
          userId: getMetaFromYArtifact(_artifactInfo).userId,
          linkAccessLevel: getMetaFromYArtifact(_artifactInfo).linkAccessLevel,
          artifactShares: [
            ...getUserAccessFromYArtifact(_artifactInfo).map.values(),
          ].map((el) => ({
            userId: el.key,
            accessLevel: el.val.accessLevel,
          })),
        }
      : _artifactInfo;

  if (artifactInfo.userId === userId) {
    return 'coowner';
  }

  const artifactShare = artifactInfo.artifactShares.find(
    (share) => share.userId === userId,
  );
  if (artifactShare) {
    return artifactShare.accessLevel;
  }

  if (artifactInfo.linkAccessLevel) {
    return artifactInfo.linkAccessLevel;
  }

  return 'noaccess';
};
