import type { ArtifactAccessLevel } from '@prisma/client';
import { Doc as YDoc } from 'yjs';
import { getWorkspaceMetaYKVFromYDoc } from './getWorkspaceMetaYKVFromYDoc';

export const getWorkspaceMetaFromYDoc = (yDoc: YDoc) => {
  const yKeyValue = getWorkspaceMetaYKVFromYDoc(yDoc);

  return {
    id: yKeyValue.get('id') as string | undefined,
    userId: yKeyValue.get('userId') as string | undefined,
    name: (yKeyValue.get('name') as string) ?? '',
    icon: (yKeyValue.get('icon') as string) ?? 'folder',
    color: (yKeyValue.get('color') as string) ?? '#6366f1',
    linkAccessLevel:
      (yKeyValue.get('linkAccessLevel') as ArtifactAccessLevel) ?? 'noaccess',
    createdAt: (yKeyValue.get('createdAt') as number) ?? new Date().getTime(),
    deletedAt: (yKeyValue.get('deletedAt') as number | null) ?? null,
  };
};
