import * as Y from 'yjs';
import { ARTIFACT_META_KEY } from '../ARTIFACT_META_KEY';
import { YArtifactMetaSchema } from './YArtifactMetaSchema';
import { ArtifactTheme } from '../types/themes';
import { ArtifactType } from '../types/ArtifactType';

export const getMetaFromYArtifact = (yArtifact: Y.Doc) => {
  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

  const artifactMeta = {
    title: artifactMetaYMap.get('title') as string,
    theme: artifactMetaYMap.get('theme') as ArtifactTheme,
    type: artifactMetaYMap.get('type') as ArtifactType,
  } satisfies YArtifactMetaSchema;

  return artifactMeta;
};
