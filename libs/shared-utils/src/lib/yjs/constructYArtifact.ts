import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type { YArtifactMeta } from '@feynote/global-types';
import { ARTIFACT_USER_ACCESS_KEY } from './ARTIFACT_USER_ACCESS_KEY';

export const constructYArtifact = (meta: YArtifactMeta) => {
  const yArtifact = new YDoc();

  yArtifact.transact(() => {
    const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

    artifactMetaYMap.set('title', meta.title);
    artifactMetaYMap.set('theme', meta.theme);
    artifactMetaYMap.set('type', meta.type);
    artifactMetaYMap.set('titleBodyMerge', meta.titleBodyMerge);
    artifactMetaYMap.set('linkAccessLevel', meta.linkAccessLevel);

    yArtifact.getArray(ARTIFACT_USER_ACCESS_KEY);
  });

  return yArtifact;
};
