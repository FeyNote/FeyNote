import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { WORKSPACE_ARTIFACTS_KEY } from './workspaceYDocKeys';

export const getWorkspaceArtifactsFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: Record<string, never>; // Values stored as a ykv for future expandability support
  }>(WORKSPACE_ARTIFACTS_KEY);
  const yKeyValue = new YKeyValue<Record<string, never>>(yArray);

  return yKeyValue;
};
