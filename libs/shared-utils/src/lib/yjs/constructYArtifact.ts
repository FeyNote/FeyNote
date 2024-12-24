import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type { YArtifactMeta } from '@feynote/global-types';

export const constructYArtifact = (meta: YArtifactMeta) => {
  const yArtifact = new YDoc();

  yArtifact.transact(() => {
    const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

    artifactMetaYMap.set('title', meta.title);
    artifactMetaYMap.set('theme', meta.theme);
    artifactMetaYMap.set('type', meta.type);
    artifactMetaYMap.set('titleBodyMerge', meta.titleBodyMerge);
  });

  return yArtifact;
};
