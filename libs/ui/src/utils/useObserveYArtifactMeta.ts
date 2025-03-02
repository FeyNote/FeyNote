import { ARTIFACT_META_KEY, getMetaFromYArtifact } from '@feynote/shared-utils';
import type {
  ArtifactAccessLevel,
  ArtifactTheme,
  ArtifactType,
} from '@prisma/client';
import { useEffect, useState } from 'react';
import { Doc as YDoc } from 'yjs';

export const useObserveYArtifactMeta = (yArtifact: YDoc) => {
  const [id, setId] = useState<string>();
  const [userId, setUserId] = useState<string>();
  const [title, setTitle] = useState<string>();
  const [theme, setTheme] = useState<ArtifactTheme>();
  const [titleBodyMerge, setTitleBodyMerge] = useState<boolean>();
  const [type, setType] = useState<ArtifactType>();
  const [linkAccessLevel, setLinkAccessLevel] = useState<
    ArtifactAccessLevel | undefined
  >();

  useEffect(() => {
    const artifactMetaMap = yArtifact.getMap(ARTIFACT_META_KEY);

    const listener = () => {
      const yArtifactMeta = getMetaFromYArtifact(yArtifact);
      setId(yArtifactMeta.id);
      setUserId(yArtifactMeta.userId);
      setTitle(yArtifactMeta.title);
      setTheme(yArtifactMeta.theme);
      setTitleBodyMerge(yArtifactMeta.titleBodyMerge);
      setType(yArtifactMeta.type);
      setLinkAccessLevel(yArtifactMeta.linkAccessLevel);
    };

    listener();
    artifactMetaMap.observe(listener);
    return () => artifactMetaMap.unobserve(listener);
  }, [yArtifact]);

  return {
    id,
    userId,
    title,
    theme,
    titleBodyMerge,
    type,
    linkAccessLevel,
  };
};
