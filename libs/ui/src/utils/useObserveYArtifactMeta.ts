import type { YArtifactMeta } from '@feynote/global-types';
import { ARTIFACT_META_KEY, getMetaFromYArtifact } from '@feynote/shared-utils';
import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { useEffect, useMemo, useState } from 'react';
import { Doc as YDoc } from 'yjs';

export const useObserveYArtifactMeta = (
  yArtifact: YDoc,
): Partial<YArtifactMeta> => {
  const [id, setId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [title, setTitle] = useState<string>();
  const [theme, setTheme] = useState<ArtifactTheme>();
  const [type, setType] = useState<ArtifactType>();
  const [linkAccessLevel, setLinkAccessLevel] = useState<
    ArtifactAccessLevel | undefined
  >();
  const [deletedAt, setDeletedAt] = useState<string | null>();

  useEffect(() => {
    const artifactMetaMap = yArtifact.getMap(ARTIFACT_META_KEY);

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(yArtifact);
      setId(yArtifactMeta.id);
      setUserId(yArtifactMeta.userId);
      setTitle(yArtifactMeta.title);
      setTheme(yArtifactMeta.theme);
      setType(yArtifactMeta.type);
      setLinkAccessLevel(yArtifactMeta.linkAccessLevel);
      setDeletedAt(yArtifactMeta.deletedAt);
    };

    listener();
    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [yArtifact]);

  // This is useful for downstream watchers that rely on change detection (useEffect/useMemo/etc)
  // since we'll provide a stable result value unless something changes.
  const result = useMemo(
    () => ({
      id,
      userId,
      title,
      theme,
      type,
      linkAccessLevel,
      deletedAt,
    }),
    [id, userId, title, theme, type, linkAccessLevel, deletedAt],
  );

  return result;
};
