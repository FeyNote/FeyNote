import * as Y from 'yjs';
import { ARTIFACT_META_KEY } from '../ARTIFACT_META_KEY';
import { YArtifactMetaSchema } from './YArtifactMetaSchema';
import { ArtifactTheme } from '@prisma/client';

export const getMetaFromYArtifact = (yArtifact: Y.Doc) => {
  const artifactMetaYMap = yArtifact.getMap(ARTIFACT_META_KEY);

  const artifactMeta = {
    title: artifactMetaYMap.get('title') as string,
    theme: artifactMetaYMap.get('theme') as ArtifactTheme,
    isPinned: artifactMetaYMap.get('isPinned') as boolean,
    isTemplate: artifactMetaYMap.get('isTemplate') as boolean,
  } satisfies YArtifactMetaSchema;

  return artifactMeta;
};
