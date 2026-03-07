import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { WORKSPACE_THREADS_KEY } from './workspaceYDocKeys';

export const getWorkspaceThreadsFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: Record<string, never>; // Values stored as a ykv for future expandability support
  }>(WORKSPACE_THREADS_KEY);
  const yKeyValue = new YKeyValue<Record<string, never>>(yArray);

  return yKeyValue;
};
