import { getArtifactTreeFromYDoc } from './getArtifactTreeFromYDoc';
import {
  ROOT_TREE_NODE_ID,
  UNCATEGORIZED_TREE_NODE_ID,
} from '../../components/artifact/ArtifactTree';

export const getArtifactTreePaths = (
  rootTitle: string | undefined,
  artifactIds: string[],
  treeYKV: ReturnType<typeof getArtifactTreeFromYDoc>,
  getArtifactTitle: (id: string) => string | undefined,
): Map<string, string[]> => {
  const parentMap = new Map<string, string | null>();

  for (const entry of treeYKV.yarray) {
    parentMap.set(entry.key, entry.val.parentNodeId);
  }

  const result = new Map<string, string[]>();

  for (const artifactId of artifactIds) {
    const parentNodeId = parentMap.get(artifactId);
    if (
      parentNodeId === undefined ||
      parentNodeId === UNCATEGORIZED_TREE_NODE_ID
    ) {
      continue;
    }

    const path: string[] = [];
    const visited = new Set<string>();
    let currentId = parentNodeId;

    while (
      currentId &&
      currentId !== ROOT_TREE_NODE_ID &&
      !visited.has(currentId)
    ) {
      visited.add(currentId);
      const title = getArtifactTitle(currentId);
      if (title) {
        path.unshift(title);
      }
      const nextParent = parentMap.get(currentId);
      if (nextParent === undefined) break;
      currentId = nextParent;
    }

    if (rootTitle) path.unshift(rootTitle);
    result.set(artifactId, path);
  }

  return result;
};
