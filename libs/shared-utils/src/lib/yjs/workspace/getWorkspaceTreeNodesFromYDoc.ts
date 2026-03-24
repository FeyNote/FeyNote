import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { WORKSPACE_TREE_NODES_KEY } from './workspaceYDocKeys';

export const getWorkspaceTreeNodesFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: { parentNodeId: string | null; order: string };
  }>(WORKSPACE_TREE_NODES_KEY);
  const yKeyValue = new YKeyValue<{
    parentNodeId: string | null;
    order: string;
  }>(yArray);

  return yKeyValue;
};
