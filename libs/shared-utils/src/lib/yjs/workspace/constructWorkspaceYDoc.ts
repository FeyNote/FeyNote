import type { ArtifactAccessLevel } from '@prisma/client';
import { Doc as YDoc } from 'yjs';
import type { YArtifactUserAccess } from '@feynote/global-types';
import { getWorkspaceMetaYKVFromYDoc } from './getWorkspaceMetaYKVFromYDoc';
import { getWorkspaceUserAccessFromYDoc } from './getWorkspaceUserAccessFromYDoc';

interface WorkspaceMetaInput {
  id: string;
  userId: string;
  name: string;
  icon?: string;
  color?: string;
  linkAccessLevel?: ArtifactAccessLevel;
  createdAt?: number;
}

export const constructWorkspaceYDoc = (
  meta: WorkspaceMetaInput,
  userAccess?: Array<{ key: string; val: YArtifactUserAccess }>,
) => {
  const yDoc = new YDoc();

  yDoc.transact(() => {
    const metaKV = getWorkspaceMetaYKVFromYDoc(yDoc);

    metaKV.set('id', meta.id);
    metaKV.set('userId', meta.userId);
    metaKV.set('name', meta.name);
    metaKV.set('icon', meta.icon ?? 'folder');
    metaKV.set('color', meta.color ?? '#6366f1');
    metaKV.set('linkAccessLevel', meta.linkAccessLevel ?? 'noaccess');
    metaKV.set('createdAt', meta.createdAt ?? new Date().getTime());
    metaKV.set('deletedAt', null);

    if (userAccess) {
      const accessKV = getWorkspaceUserAccessFromYDoc(yDoc);
      for (const { key, val } of userAccess) {
        accessKV.set(key, val);
      }
    }
  });

  return yDoc;
};
