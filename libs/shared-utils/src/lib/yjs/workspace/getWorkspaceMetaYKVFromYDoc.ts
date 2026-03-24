import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { WORKSPACE_META_KEY } from './workspaceYDocKeys';

export const getWorkspaceMetaYKVFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: string | number | null;
  }>(WORKSPACE_META_KEY);
  return new YKeyValue<string | number | null>(yArray);
};
