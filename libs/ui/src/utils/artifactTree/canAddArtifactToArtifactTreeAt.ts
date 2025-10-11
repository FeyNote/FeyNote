import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc } from 'yjs';
import { getArtifactTreeFromYDoc } from './getArtifactTreeFromYDoc';

/**
 * This helper checks if you can add a node at a given parent such as
 * to avoid a circular loop in the tree hierarchy.
 */
export function canAddArtifactToArtifactTreeAt(args: {
  ref:
    | YKeyValue<{
        parentNodeId: string | null;
        order: string;
      }>
    | YDoc;
  id: string;
  parentNodeId: string | null;
}) {
  const treeYKV = (() => {
    if (args.ref instanceof YKeyValue) {
      return args.ref;
    }

    return getArtifactTreeFromYDoc(args.ref).yKeyValue;
  })();

  if (args.parentNodeId === null) return true;

  const desiredParentNode = treeYKV.get(args.parentNodeId);
  if (!desiredParentNode) return false;

  /**
   * Crawls upwards in the tree looking to see if the target node
   * is a descendant of the node we're adding.
   * This will return true if the node provided is a parent of the node we're
   * trying to add, and false if this node is not a descendant (which means we're free to add
   * as a child of it
   */
  const isIdentityParent = (node: {
    id: string;
    parentNodeId: string | null;
    order: string;
  }) => {
    // WARNING: This double check for id and parentNodeId is _critical_
    // An element might point to a parentNodeId that doesn't actually exist
    // in the tree and might then not have a parentNode, but will have a parentNodeId.
    // Without that check, there's an edge case where you could create a circular reference.
    if (node.id === args.id || node.parentNodeId === args.id) {
      return true;
    }

    if (!node.parentNodeId) return false;

    const parentNode = treeYKV.get(node.parentNodeId);
    // parentNode will not be present in the case where this item was previously
    // a child of another node, but that node has since been removed from the tree (which is perfectly allowable!)
    if (parentNode) {
      return isIdentityParent({
        id: node.parentNodeId,
        ...parentNode,
      });
    }

    return false;
  };

  return !isIdentityParent({
    id: args.parentNodeId,
    ...desiredParentNode,
  });
}
