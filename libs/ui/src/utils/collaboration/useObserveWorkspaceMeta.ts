import type { ArtifactAccessLevel } from '@prisma/client';
import {
  getWorkspaceMetaFromYDoc,
  getWorkspaceMetaYKVFromYDoc,
} from '@feynote/shared-utils';
import { useEffect, useMemo, useState } from 'react';
import { Doc as YDoc } from 'yjs';

export const useObserveWorkspaceMeta = (yDoc: YDoc) => {
  const [id, setId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('folder');
  const [color, setColor] = useState('#6366f1');
  const [linkAccessLevel, setLinkAccessLevel] =
    useState<ArtifactAccessLevel>('noaccess');
  const [createdAt, setCreatedAt] = useState<number>();
  const [deletedAt, setDeletedAt] = useState<number | null>(null);

  useEffect(() => {
    const metaYKV = getWorkspaceMetaYKVFromYDoc(yDoc);

    const listener = () => {
      const values = getWorkspaceMetaFromYDoc(yDoc);
      setId(values.id);
      setUserId(values.userId);
      setName(values.name);
      setIcon(values.icon);
      setColor(values.color);
      setLinkAccessLevel(values.linkAccessLevel);
      setCreatedAt(values.createdAt);
      setDeletedAt(values.deletedAt);
    };

    listener();
    metaYKV.on('change', listener);
    return () => metaYKV.off('change', listener);
  }, [yDoc]);

  const result = useMemo(
    () => ({
      id,
      userId,
      name,
      icon,
      color,
      linkAccessLevel,
      createdAt,
      deletedAt,
    }),
    [id, userId, name, icon, color, linkAccessLevel, createdAt, deletedAt],
  );

  return result;
};
