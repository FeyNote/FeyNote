import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from '../ARTIFACT_META_KEY';
import type { YArtifactMeta } from '@feynote/global-types';
import type { ArtifactTheme, ArtifactType } from '@prisma/client';

export const getMetaFromYArtifact = (yArtifact: YDoc) => {
  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

  const artifactMeta = {
    title: (artifactMetaYMap.get('title') as string) ?? '',
    theme: (artifactMetaYMap.get('theme') as ArtifactTheme) ?? 'default',
    type: (artifactMetaYMap.get('type') as ArtifactType) ?? 'tiptap',
    titleBodyMerge: (artifactMetaYMap.get('titleBodyMerge') as boolean) ?? true,
  } satisfies YArtifactMeta;

  return artifactMeta;
};
