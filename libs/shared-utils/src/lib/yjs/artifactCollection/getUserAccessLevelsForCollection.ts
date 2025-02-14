import {
  ArtifactAccessLevel,
  ArtifactCollectionAccessLevel,
} from '@prisma/client';
import { getTreeFromYDoc, TreeYKVNode } from './getTreeFromYDoc';
import { getUserAccessLevelForTreeNode } from './getUserAccessLevelForTreeNode';
import { Doc as YDoc } from 'yjs';
import { getMetaFromYArtifactCollection } from './getMetaFromYArtifactCollection';

/**
 * Builds a map where the key is a given nodeId (in this case, artifactId)
 * and the value is their access level
 */
export const getUserAccessLevelsForCollection = (
  collectionYDoc: YDoc,
  userId: string,
) => {
  const yMeta = getMetaFromYArtifactCollection(collectionYDoc);

  const rootAccessLevel =
    yMeta.userAccess?.get(userId)?.accessLevel ?? yMeta.linkAccessLevel;
  const fallbackArtifactAccessLevel =
    rootAccessLevel === ArtifactCollectionAccessLevel.readadd
      ? ArtifactAccessLevel.readonly
      : rootAccessLevel;

  const tree = getTreeFromYDoc(collectionYDoc);
  const nodesById = new Map<string, TreeYKVNode>();
  for (const node of tree.yArray) {
    nodesById.set(node.key, node.val);
  }

  const accessLevelsByNodeId = new Map<string, ArtifactAccessLevel>();
  for (const node of tree.yArray) {
    const accessLevel = getUserAccessLevelForTreeNode(
      nodesById,
      accessLevelsByNodeId,
      node.key,
      userId,
      fallbackArtifactAccessLevel || ArtifactAccessLevel.noaccess,
    );

    accessLevelsByNodeId.set(node.key, accessLevel);
  }

  return accessLevelsByNodeId;
};
