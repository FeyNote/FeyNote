import { Doc as YDoc } from 'yjs';
import { ARTIFACT_COLLECTION_META_KEY } from './ARTIFACT_COLLECTION_META_KEY';
import type { YArtifactCollectionMeta } from '@feynote/global-types';

export const constructYArtifactCollection = (meta: YArtifactCollectionMeta) => {
  const yArtifactCollection = new YDoc();

  yArtifactCollection.transact(() => {
    const metaYMap = yArtifactCollection.getMap(ARTIFACT_COLLECTION_META_KEY);

    metaYMap.set('id', meta.id);
    metaYMap.set('title', meta.title);
    metaYMap.set('theme', meta.linkAccessLevel);
    metaYMap.set('userAccess', meta.userAccess);
  });

  return yArtifactCollection;
};
