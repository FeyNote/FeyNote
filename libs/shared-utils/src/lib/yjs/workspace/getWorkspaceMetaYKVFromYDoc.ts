import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { WORKSPACE_META_KEY } from './workspaceYDocKeys';
import type { TypedYKV } from '../TypedYKV';
import type { YWorkspaceMeta } from './YWorkspaceMeta';

export const getWorkspaceMetaYKVFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: YWorkspaceMeta;
  }>(WORKSPACE_META_KEY);
  return new YKeyValue(yArray) as TypedYKV<YWorkspaceMeta>;
};

