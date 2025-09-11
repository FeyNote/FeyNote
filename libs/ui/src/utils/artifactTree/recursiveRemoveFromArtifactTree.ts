import { YKeyValue } from "y-utility/y-keyvalue";
import { Doc as YDoc } from 'yjs';
import { getArtifactTreeFromYDoc } from "./getArtifactTreeFromYDoc";

/**
  * This helper checks if you can add a node at a given parent such as
  * to avoid a circular loop in the tree hierarchy.
*/
export function recursiveRemoveFromArtifactTree(args: {
  ref: YKeyValue<{
    parentNodeId: string | null;
    order: string;
  }> | YDoc,
  nodeIds: ReadonlySet<string>
}) {
  const treeYKV = (() => {
    if (args.ref instanceof YKeyValue) {
      return args.ref;
    }

    return getArtifactTreeFromYDoc(args.ref).yKeyValue;
  })();

  const nodesByParentId = treeYKV.yarray.toArray().reduce((acc, el) => {
    let arr = acc.get(el.val.parentNodeId);
    if (!arr) {
      arr = [];
      acc.set(el.val.parentNodeId, arr);
    }

    arr.push(el.key);

    return acc;
  }, new Map<string | null, string[]>());

  const recursiveDeleteNode = (nodeId: string) => {
    treeYKV.delete(nodeId);

    const children = nodesByParentId.get(nodeId);
    if (children) {
      for (const child of children) {
        const el = treeYKV.get(child);
        if (el) recursiveDeleteNode(nodeId);
      }
    }
  }

  for (const nodeId of args.nodeIds) {
    recursiveDeleteNode(nodeId);
  }
}

