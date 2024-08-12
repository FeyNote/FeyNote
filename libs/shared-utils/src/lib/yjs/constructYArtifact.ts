import * as Y from 'yjs';
import { ARTIFACT_META_KEY } from '../ARTIFACT_META_KEY';
import { YArtifactMetaSchema } from './YArtifactMetaSchema';

export const constructYArtifact = (meta: YArtifactMetaSchema) => {
  const yArtifact = new Y.Doc();

  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

  artifactMetaYMap.set('title', meta.title);
  artifactMetaYMap.set('theme', meta.theme);
  artifactMetaYMap.set('type', meta.type);

  return yArtifact;
};
