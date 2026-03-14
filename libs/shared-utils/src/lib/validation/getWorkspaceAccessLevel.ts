import type { ArtifactAccessLevel } from '@prisma/client';
import { Doc as YDoc } from 'yjs';
import { getWorkspaceMetaFromYDoc } from '../yjs/workspace/getWorkspaceMetaFromYDoc';
import { getWorkspaceUserAccessFromYDoc } from '../yjs/workspace/getWorkspaceUserAccessFromYDoc';
import type { WorkspaceSnapshot } from '@feynote/global-types';

type SimplePermissionsRepresentation = {
  userId: string;
  linkAccessLevel: ArtifactAccessLevel | null;
  workspaceShares: {
    userId: string;
    accessLevel: ArtifactAccessLevel;
  }[];
};

const transformInfo = (
  info: SimplePermissionsRepresentation | YDoc | WorkspaceSnapshot,
): SimplePermissionsRepresentation => {
  if (info instanceof YDoc) {
    const meta = getWorkspaceMetaFromYDoc(info);
    return {
      userId: meta.userId ?? '',
      linkAccessLevel: meta.linkAccessLevel,
      workspaceShares: [
        ...getWorkspaceUserAccessFromYDoc(info).yarray.toArray(),
      ].map((el) => ({ userId: el.key, accessLevel: el.val.accessLevel })),
    };
  } else if ('userId' in info) {
    return info;
  } else {
    return {
      userId: info.meta.userId,
      linkAccessLevel: info.meta.linkAccessLevel,
      workspaceShares: info.userAccess.map((el) => ({
        userId: el.key,
        accessLevel: el.val.accessLevel,
      })),
    };
  }
};

export const getWorkspaceAccessLevel = (
  _info: SimplePermissionsRepresentation | YDoc | WorkspaceSnapshot,
  currentUserId: string | undefined,
): ArtifactAccessLevel => {
  const info = transformInfo(_info);

  if (currentUserId && info.userId === currentUserId) {
    return 'coowner';
  }

  const workspaceShare =
    !!currentUserId &&
    info.workspaceShares.find((share) => share.userId === currentUserId);
  if (workspaceShare) {
    return workspaceShare.accessLevel;
  }

  if (info.linkAccessLevel) {
    return info.linkAccessLevel;
  }

  return 'noaccess';
};
