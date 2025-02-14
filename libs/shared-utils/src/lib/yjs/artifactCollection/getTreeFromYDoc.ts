import { Doc as YDoc } from 'yjs';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { TypedArray, TypedMap } from 'yjs-types';
import { ArtifactAccessLevel } from '@prisma/client';

/**
 * The key for where we store the tree nodes in the YDoc
 * NOTE: This must not be changed without a DB data migration otherwise all trees will be erased
 */
const TREE_NODES_KEY = 'treeNodes';

export interface TreeYKVNode {
  key: string;
  val: {
    userAccess: TypedMap<{
      [userId: string]: ArtifactAccessLevel;
    }>;
    parentNodeId: string | null;
    order: string;
  };
}

export const getTreeFromYDoc = (yDoc: YDoc) => {
  const yArray = yDoc.getArray<TreeYKVNode>(TREE_NODES_KEY);
  const yKeyValue = new YKeyValue<TreeYKVNode['val']>(yArray);

  return {
    yArray: yArray as TypedArray<TreeYKVNode>,
    yKeyValue,
  };
};
