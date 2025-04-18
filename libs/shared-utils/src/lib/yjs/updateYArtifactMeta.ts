import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type {
  UpdatableYArtifactMeta,
  YArtifactMeta,
} from '@feynote/global-types';
import type { TypedMap } from 'yjs-types';

export const updateYArtifactMeta = (
  yArtifact: YDoc,
  meta: UpdatableYArtifactMeta,
) => {
  yArtifact.transact(() => {
    const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY) as TypedMap<
      Partial<YArtifactMeta>
    >;

    artifactMetaYMap.set('title', meta.title);
    artifactMetaYMap.set('theme', meta.theme);
    artifactMetaYMap.set('type', meta.type);
    artifactMetaYMap.set('linkAccessLevel', meta.linkAccessLevel);
    artifactMetaYMap.set('deletedAt', meta.deletedAt);
  });
};
