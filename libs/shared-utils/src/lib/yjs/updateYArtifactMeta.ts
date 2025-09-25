import { Doc as YDoc } from 'yjs';
import { ARTIFACT_META_KEY } from './ARTIFACT_META_KEY';
import type {
  UpdatableYArtifactMeta,
  YArtifactMeta,
} from '@feynote/global-types';
import type { TypedMap } from 'yjs-types';

export const updateYArtifactMeta = (
  yArtifact: YDoc,
  meta: Partial<UpdatableYArtifactMeta>,
) => {
  yArtifact.transact(() => {
    const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY) as TypedMap<
      Partial<YArtifactMeta>
    >;

    if (meta.title !== undefined) artifactMetaYMap.set('title', meta.title);
    if (meta.theme !== undefined) artifactMetaYMap.set('theme', meta.theme);
    if (meta.type !== undefined) artifactMetaYMap.set('type', meta.type);
    if (meta.linkAccessLevel !== undefined)
      artifactMetaYMap.set('linkAccessLevel', meta.linkAccessLevel);
    if (meta.deletedAt !== undefined)
      artifactMetaYMap.set('deletedAt', meta.deletedAt);
  });
};
