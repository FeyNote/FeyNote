import * as Y from 'yjs';
import { ARTIFACT_META_KEY } from '../ARTIFACT_META_KEY';
import { YArtifactMetaSchema } from './YArtifactMetaSchema';

export const updateYArtifactMeta = (
  yArtifact: Y.Doc,
  meta: YArtifactMetaSchema,
) => {
  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

  artifactMetaYMap.set('title', meta.title);
  artifactMetaYMap.set('theme', meta.theme);
  artifactMetaYMap.set('isPinned', meta.isPinned);
  artifactMetaYMap.set('isTemplate', meta.isTemplate);
};
