import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc } from 'yjs';
import { getArtifactTreeFromYDoc } from './getArtifactTreeFromYDoc';

/**
 * This helper removes elements from the artifact tree
 * as well as any of their descendants
 */
export function recursiveRemoveFromArtifactTree(args: {
  ref:
    | YKeyValue<{
        parentNodeId: string | null;
        order: string;
      }>
    | YDoc;
  nodeIds: ReadonlySet<string>;
}) {
  const treeYKV = (() => {
    if (args.ref instanceof YKeyValue) {
      return args.ref;
    }

    return getArtifactTreeFromYDoc(args.ref);
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

  treeYKV.doc.transact(() => {
    const recursiveDeleteNode = (nodeId: string) => {
      treeYKV.delete(nodeId);

      const children = nodesByParentId.get(nodeId);
      if (children) {
        for (const child of children) {
          const el = treeYKV.get(child);
          if (el) recursiveDeleteNode(nodeId);
        }
      }
    };

    for (const nodeId of args.nodeIds) {
      recursiveDeleteNode(nodeId);
    }
  });
}
