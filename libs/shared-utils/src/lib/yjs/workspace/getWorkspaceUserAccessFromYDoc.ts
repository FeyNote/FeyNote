import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import type { YArtifactUserAccess } from '@feynote/global-types';
import { WORKSPACE_USER_ACCESS_KEY } from './workspaceYDocKeys';

export const getWorkspaceUserAccessFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: YArtifactUserAccess;
  }>(WORKSPACE_USER_ACCESS_KEY);
  const yKeyValue = new YKeyValue<YArtifactUserAccess>(yArray);

  return yKeyValue;
};
