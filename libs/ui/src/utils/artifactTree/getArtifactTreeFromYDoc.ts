import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc } from 'yjs';

const ARTIFACT_TREE_NODE_ARRAY_KEY = 'treeNodes';

export const getArtifactTreeFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray(ARTIFACT_TREE_NODE_ARRAY_KEY);
  const yKeyValue = new YKeyValue<{
    parentNodeId: string | null;
    order: string;
  }>(yArray as any);

  return {
    yArray,
    yKeyValue,
  };
};
