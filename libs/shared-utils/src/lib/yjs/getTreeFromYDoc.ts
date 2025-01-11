import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { TypedArray } from 'yjs-types';

/**
 * The key for where we store the tree nodes in the YDoc
 * NOTE: This must not be changed without a DB data migration otherwise all trees will be erased
 */
const TREE_NODES_KEY = 'treeNodes';

export const getTreeFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<{
    key: string;
    val: {
      parentNodeId: string | null;
      order: string;
    };
  }>(TREE_NODES_KEY);
  const yKeyValue = new YKeyValue<{
    parentNodeId: string | null;
    order: string;
  }>(yArray);

  return {
    yArray: yArray as TypedArray<{
      key: string;
      val: {
        parentNodeId: string | null;
        order: string;
      };
    }>,
    yKeyValue,
  };
};
