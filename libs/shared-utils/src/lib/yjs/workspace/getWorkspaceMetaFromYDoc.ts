import type { ArtifactAccessLevel } from '@prisma/client';
import { Doc as YDoc } from 'yjs';
import { getWorkspaceMetaYKVFromYDoc } from './getWorkspaceMetaYKVFromYDoc';

export const getWorkspaceMetaFromYDoc = (yDoc: YDoc) => {
  const yKeyValue = getWorkspaceMetaYKVFromYDoc(yDoc);

  return {
    id: yKeyValue.get('id'),
    userId: yKeyValue.get('userId'),
    name: yKeyValue.get('name') ?? '',
    icon: yKeyValue.get('icon') ?? 'folder',
    color: yKeyValue.get('color') ?? '#6366f1',
    linkAccessLevel:
      yKeyValue.get('linkAccessLevel') ??
      ('noaccess' satisfies ArtifactAccessLevel),
    createdAt: yKeyValue.get('createdAt') ?? new Date().getTime(),
    deletedAt: yKeyValue.get('deletedAt') ?? null,
  };
};
