import { Doc as YDoc } from 'yjs';
import type { YArtifactCollectionMeta } from '@feynote/global-types';
import { ARTIFACT_COLLECTION_META_KEY } from './ARTIFACT_COLLECTION_META_KEY';
import { TypedMap } from 'yjs-types';

export const getMetaFromYArtifactCollection = (yArtifact: YDoc) => {
  const artifactCollectionMetaYMap = yArtifact.getMap(
    ARTIFACT_COLLECTION_META_KEY,
  ) as TypedMap<Partial<YArtifactCollectionMeta>>;

  const artifactMeta = {
    id: artifactCollectionMetaYMap.get('id'),
    title: artifactCollectionMetaYMap.get('title') ?? '',
    userAccess: artifactCollectionMetaYMap.get('userAccess'),
    linkAccessLevel: artifactCollectionMetaYMap.get('linkAccessLevel'),
  } satisfies Partial<YArtifactCollectionMeta>;

  return artifactMeta;
};
