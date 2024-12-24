import { TreeItem } from 'react-complex-tree';
import * as Sentry from '@sentry/react';

import { InternalTreeItem } from '../../components/artifact/ArtifactTree';

/**
 * It's technically possible to have a tree with a cycle, but that would be due to us making a mistake, so we should handle that and log it if so
 */
const MAX_CHILD_RECURSE_DEPTH = 100;

export const getAllChildIdsForTreeItem = (
  itemsById: Record<string, TreeItem<InternalTreeItem>>,
  item: TreeItem<InternalTreeItem>,
  depth: number,
): string[] => {
  if (depth > MAX_CHILD_RECURSE_DEPTH) {
    Sentry.captureException('Max tree child recursion depth exceeded!', {
      extra: {
        item,
      },
    });

    return [];
  }

  const childIds: string[] = [];
  item.children?.forEach((child) => {
    childIds.push(child.toString());

    const childNode = itemsById[child.toString()];
    if (childNode) {
      childIds.push(
        ...getAllChildIdsForTreeItem(itemsById, childNode, depth + 1),
      );
    }
  });

  return childIds;
};
