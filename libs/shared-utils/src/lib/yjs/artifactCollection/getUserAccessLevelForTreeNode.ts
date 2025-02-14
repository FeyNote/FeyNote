import type { ArtifactAccessLevel } from '@prisma/client';
import { TreeYKVNode } from './getTreeFromYDoc';

/**
 * Retrieves the access level a user has to a particular node in the tree.
 * Uses dynamic programming to memoize seen access levels into accessLevelsByNodeId for performance
 */
export const getUserAccessLevelForTreeNode = (
  nodesById: Map<string, TreeYKVNode>,
  accessLevelsByNodeId = new Map<string, ArtifactAccessLevel>(),
  nodeId: string,
  userId: string,
  rootAccessLevel: ArtifactAccessLevel,
  visitedNodes = new Set<string>(),
): ArtifactAccessLevel => {
  if (visitedNodes.has(nodeId)) {
    throw new Error('Cycle detected in artifact collection tree');
  }
  visitedNodes.add(nodeId);

  const node = nodesById.get(nodeId);
  if (!node) {
    return rootAccessLevel;
  }

  const memoizedAccessLevel = accessLevelsByNodeId.get(nodeId);
  if (memoizedAccessLevel) {
    return memoizedAccessLevel;
  }

  const nodeUserAccess = node.val.userAccess.get(userId);
  if (nodeUserAccess) {
    // Memoize the access level (dynamic programming)
    accessLevelsByNodeId.set(nodeId, nodeUserAccess);
    return nodeUserAccess;
  }

  if (node.val.parentNodeId) {
    const parentAccessLevel = getUserAccessLevelForTreeNode(
      nodesById,
      accessLevelsByNodeId,
      node.val.parentNodeId,
      userId,
      rootAccessLevel,
      visitedNodes,
    );

    // Memoize the access level (dynamic programming)
    accessLevelsByNodeId.set(nodeId, parentAccessLevel);
    return parentAccessLevel;
  }

  return rootAccessLevel;
};
