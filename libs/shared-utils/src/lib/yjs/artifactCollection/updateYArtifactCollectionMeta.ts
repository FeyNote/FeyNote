import { Doc as YDoc } from 'yjs';
import { ARTIFACT_COLLECTION_META_KEY } from './ARTIFACT_COLLECTION_META_KEY';
import type { YArtifactCollectionMeta } from '@feynote/global-types';

export const updateYArtifactCollectionMeta = (
  yArtifact: YDoc,
  meta: Omit<YArtifactCollectionMeta, 'id' | 'userAccess'>,
) => {
  yArtifact.transact(() => {
    const artifactMetaYMap = yArtifact.getMap(ARTIFACT_COLLECTION_META_KEY);

    artifactMetaYMap.set('title', meta.title);
    artifactMetaYMap.set('linkAccessLevel', meta.linkAccessLevel);
  });
};
