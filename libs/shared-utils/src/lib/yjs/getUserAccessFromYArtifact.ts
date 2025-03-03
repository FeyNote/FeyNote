import { Doc as YDoc, Array as YArray } from 'yjs';
import type { YArtifactUserAccess } from '@feynote/global-types';
import { ARTIFACT_USER_ACCESS_KEY } from './ARTIFACT_USER_ACCESS_KEY';
import { YKeyValue } from 'y-utility/y-keyvalue';

export const getUserAccessFromYArtifact = (yArtifact: YDoc) => {
  const artifactUserAccessArray = yArtifact.getArray(
    ARTIFACT_USER_ACCESS_KEY,
  ) as YArray<{
    key: string;
    val: YArtifactUserAccess;
  }>;
  const ykv = new YKeyValue(artifactUserAccessArray);

  return ykv;
};
