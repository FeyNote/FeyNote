import type { ArtifactAccessLevel } from '@prisma/client';
import { Doc as YDoc } from 'yjs';
import { getMetaFromYArtifact } from '../yjs/getMetaFromYArtifact';
import { getUserAccessFromYArtifact } from '../yjs/getUserAccessFromYArtifact';
import type { ArtifactSnapshot } from '@feynote/global-types';

type SimplePermissionsRepresentation = {
  userId: string;
  linkAccessLevel: ArtifactAccessLevel | null;
  artifactShares: {
    userId: string;
    accessLevel: ArtifactAccessLevel;
  }[];
};

const transformInfo = (
  info: SimplePermissionsRepresentation | YDoc | ArtifactSnapshot,
): SimplePermissionsRepresentation => {
  if (info instanceof YDoc) {
    return {
      userId: getMetaFromYArtifact(info).userId,
      linkAccessLevel: getMetaFromYArtifact(info).linkAccessLevel,
      artifactShares: [...getUserAccessFromYArtifact(info).map.values()].map(
        (el) => ({
          userId: el.key,
          accessLevel: el.val.accessLevel,
        }),
      ),
    };
  } else if ('userId' in info) {
    return info;
  } else {
    return {
      userId: info.meta.userId,
      linkAccessLevel: info.meta.linkAccessLevel,
      artifactShares: info.userAccess.map((el) => ({
        userId: el.key,
        accessLevel: el.val.accessLevel,
      })),
    };
  }
};

/**
 * Can be passed either a YDoc or server-side artifact sharing info structure.
 * Returns access level for a given userId to that artifact
 *
 * @param currentUserId The id of the current signed-in user, or `undefined` if the user is not signed in
 */
export const getArtifactAccessLevel = (
  _info: SimplePermissionsRepresentation | YDoc | ArtifactSnapshot,
  currentUserId: string | undefined,
): ArtifactAccessLevel => {
  const info = transformInfo(_info);

  if (currentUserId && info.userId === currentUserId) {
    return 'coowner';
  }

  const artifactShare =
    !!currentUserId &&
    info.artifactShares.find((share) => share.userId === currentUserId);
  if (artifactShare) {
    return artifactShare.accessLevel;
  }

  if (info.linkAccessLevel) {
    return info.linkAccessLevel;
  }

  return 'noaccess';
};
