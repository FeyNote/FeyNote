import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  dragAndDropFeature,
  hotkeysCoreFeature,
  ItemInstance,
  syncDataLoaderFeature,
  type DragTarget,
} from '@headless-tree/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTree } from '@headless-tree/react';
import styled from 'styled-components';
import { t } from 'i18next';

import { useSessionContext } from '../../context/session/SessionContext';
import { PreferenceNames } from '@feynote/shared-utils';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { ArtifactTreeItem } from './ArtifactTreeItem';
import {
  getCustomDragData,
  setCustomDragData,
} from '../../utils/artifactTree/customDrag';
import {
  calculateOrderForArtifactTreeNode,
  type TreeOrderCalculationLocation,
} from '../../utils/artifactTree/calculateOrderForArtifactTreeNode';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';
import { useNavigateWithKeyboardHandler } from '../../utils/useNavigateWithKeyboardHandler';
import { useGlobalPaneContext } from '../../context/globalPane/GlobalPaneContext';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useArtifactSnapshotsForCurrentWorkspace } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshotsForCurrentWorkspace';
import { getArtifactTreeFromYDoc } from '../../utils/artifactTree/getArtifactTreeFromYDoc';
import { useAcceptedIncomingSharedArtifactIds } from '../../utils/artifactTree/useAcceptedIncomingSharedArtifactIds';
import { useTreeExpandedItems } from './useTreeExpandedItems';
import { useObserveYKVChanges } from '../../utils/collaboration/useObserveYKVChanges';

const TreeContainer = styled.div`
  height: 100%;
  overflow: auto;
`;

const TreeVirtualizer = styled.div`
  width: 100%;
  position: relative;
`;

const DragLine = styled.div`
  height: 4px;
  background-color: var(--ion-color-primary-shade);
`;

export interface InternalTreeItem {
  id: string;
  title: string;
  order: string;
  isHidden?: boolean;
  parentId: string | null;
}

export const ROOT_TREE_NODE_ID = 'root';
export const UNCATEGORIZED_TREE_NODE_ID = 'uncategorized';
/**
 * We reset order for all uncategorized items since
 * we have no way of tracking predictable order for things that don't exist in the tree
 * and so the reordering experience would be quite poor.
 * The exact value of this doesn't really matter, it just needs to be the same for all items.
 */
export const UNCATEGORIZED_CHILD_INDEX = 'X';

interface Props {
  treeId: string; // This should be globally unique!
  registerAsGlobalTreeDragHandler: boolean; // This should only be enabled for the sidemenu tree
  editable: boolean;
  mode: 'navigate' | 'select';
  enableItemContextMenu: boolean;
  onNodeClicked?: (info: {
    parentId: string;
    targetId: string;
    treeId: string;
  }) => void;
  enableOpenItemMemory?: boolean;
}

export const ArtifactTree: React.FC<Props> = (props) => {
  const { session } = useSessionContext();
  const { getPreference } = usePreferencesContext();
  const leftPaneArtifactTreeShowUncategorized = getPreference(
    PreferenceNames.LeftPaneArtifactTreeShowUncategorized,
  );
  const leftPaneArtifactTreeAutoExpandOnNavigate = getPreference(
    PreferenceNames.LeftPaneArtifactTreeAutoExpandOnNavigate,
  );
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { artifactSnapshots } = useArtifactSnapshots();
  const { artifactSnapshotsForWorkspace } =
    useArtifactSnapshotsForCurrentWorkspace();
  const { expandedItems, setExpandedItems } = useTreeExpandedItems(
    currentWorkspaceId,
    props.enableOpenItemMemory,
  );
  const expandedItemsRef = useRef(expandedItems);
  expandedItemsRef.current = expandedItems;
  const globalPaneContext = useGlobalPaneContext();
  const focusedPane = globalPaneContext.getPaneById(undefined);

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { navigateWithKeyboardHandler } = useNavigateWithKeyboardHandler();

  const userTreeConnection = useCollaborationConnection(
    `userTree:${session.userId}`,
  );
  const workspaceOrUserTreeConnection = useCollaborationConnection(
    currentWorkspaceId
      ? `workspace:${currentWorkspaceId}`
      : `userTree:${session.userId}`,
  );

  const treeYKV = useMemo(() => {
    return getArtifactTreeFromYDoc(workspaceOrUserTreeConnection.yjsDoc);
  }, [workspaceOrUserTreeConnection.yjsDoc]);
  const { rerenderReducerValue } = useObserveYKVChanges(treeYKV);

  const { acceptedIncomingSharedArtifactIds } =
    useAcceptedIncomingSharedArtifactIds(userTreeConnection.yjsDoc);

  const { treeItemsById, itemIdsByParentId } = useMemo(() => {
    const artifactsById = new Map(
      (artifactSnapshotsForWorkspace || artifactSnapshots).map((artifact) => [
        artifact.id,
        artifact,
      ]),
    );

    const kvEntries = new Map(treeYKV.yarray.map((el) => [el.key, el.val]));

    const treeItemsById = new Map<string, InternalTreeItem>();

    for (const [key, val] of kvEntries.entries()) {
      const artifact = artifactsById.get(key);
      if (!artifact) {
        if (currentWorkspaceId) {
          treeItemsById.set(key, {
            id: key,
            title: t('artifactTree.hiddenDocument'),
            order: val.order,
            parentId: val.parentNodeId || ROOT_TREE_NODE_ID,
            isHidden: true,
          });
        }
        continue;
      }

      let order = val.order;
      if (val.parentNodeId === UNCATEGORIZED_TREE_NODE_ID) {
        order = UNCATEGORIZED_CHILD_INDEX;
      }

      treeItemsById.set(key, {
        id: key,
        title: artifact.meta.title,
        order,
        parentId: val.parentNodeId || ROOT_TREE_NODE_ID,
      });
    }

    // Artifacts that are not explicitly added to tree should be added to uncategorized
    for (const artifact of artifactSnapshotsForWorkspace || artifactSnapshots) {
      if (treeItemsById.has(artifact.id)) continue;

      // In non-workspaced view, filter out inbox items (shared with user but not yet accepted)
      // We want to include inbox items in workspaces, since other users may have added them and there are some strange implications here.
      if (
        !currentWorkspaceId &&
        artifact.meta.userId !== session.userId &&
        !acceptedIncomingSharedArtifactIds.has(artifact.id)
      ) {
        continue;
      }

      treeItemsById.set(artifact.id, {
        id: artifact.id,
        title: artifact.meta.title,
        order: UNCATEGORIZED_CHILD_INDEX,
        parentId: UNCATEGORIZED_TREE_NODE_ID,
      });
    }

    let uncategorizedItemRef: InternalTreeItem | null = null;
    if (leftPaneArtifactTreeShowUncategorized) {
      // All uncategorized items go under their own header
      uncategorizedItemRef = {
        id: UNCATEGORIZED_TREE_NODE_ID,
        title: t('artifactTree.uncategorized', {
          count: 0,
        }),
        // We allow the user to move the uncategorized item around if they desire
        order: treeYKV.get(UNCATEGORIZED_TREE_NODE_ID)?.order || 'XY',
        parentId: ROOT_TREE_NODE_ID,
      };
      treeItemsById.set(UNCATEGORIZED_TREE_NODE_ID, uncategorizedItemRef);
    } else {
      treeItemsById.delete(UNCATEGORIZED_TREE_NODE_ID);
    }

    const sortedTreeItems = Array.from(treeItemsById.values()).sort((a, b) => {
      const comparison = a.order.localeCompare(b.order);
      if (comparison === 0) {
        const titleComparison = a.title.localeCompare(b.title);
        if (titleComparison === 0) {
          return a.id.localeCompare(a.id);
        }
        return titleComparison;
      }
      return comparison;
    });

    const getItemIdsByParentId = () => {
      const itemIdsByParentId = new Map<string | null, string[]>();

      for (const entry of sortedTreeItems) {
        const siblingList = itemIdsByParentId.get(entry.parentId) ?? [];
        siblingList.push(entry.id);
        if (!itemIdsByParentId.has(entry.parentId)) {
          itemIdsByParentId.set(entry.parentId, siblingList);
        }
      }
      return itemIdsByParentId;
    };

    if (uncategorizedItemRef) {
      const _itemIdsByParentId = getItemIdsByParentId();
      let uncategorizedCount = 0;
      const seenIds = new Set();
      const countUncategorizedItems = (itemId: string) => {
        // Check for tree cycles
        if (seenIds.has(itemId)) return;
        seenIds.add(itemId);

        const item = treeItemsById.get(itemId);
        if (!item) return;

        // Do not count the header itself
        if (item.id !== UNCATEGORIZED_TREE_NODE_ID) uncategorizedCount++;

        for (const id of _itemIdsByParentId.get(itemId) || []) {
          countUncategorizedItems(id);
        }
      };
      countUncategorizedItems(UNCATEGORIZED_TREE_NODE_ID);
      uncategorizedItemRef.title = t('artifactTree.uncategorized', {
        count: uncategorizedCount,
      });
    }

    const itemIdsByParentId = getItemIdsByParentId();

    // Create root node
    treeItemsById.set(ROOT_TREE_NODE_ID, {
      id: ROOT_TREE_NODE_ID,
      title: 'Root', // This is not shown to users
      order: 'X', // This does not matter
      parentId: null,
    });

    return { treeItemsById, itemIdsByParentId };
  }, [
    treeYKV,
    rerenderReducerValue,
    leftPaneArtifactTreeShowUncategorized,
    artifactSnapshots,
    artifactSnapshotsForWorkspace,
    acceptedIncomingSharedArtifactIds,
  ]);

  const onDrop = (
    itemIds: string[],
    target: DragTarget<InternalTreeItem | undefined>,
  ) => {
    const location = ((): TreeOrderCalculationLocation => {
      if (!('insertionIndex' in target)) {
        return {
          position: 'beginning',
        };
      }

      const targetChildren = target.item.getChildren();
      const beforeItem = targetChildren.at(target.childIndex);
      const afterItem = targetChildren.at(target.childIndex - 1);
      if (beforeItem && afterItem && target.childIndex !== 0) {
        return {
          position: 'between',
          beforeNodeId: beforeItem.getId(),
          afterNodeId: afterItem.getId(),
        };
      } else if (beforeItem) {
        return {
          position: 'beginning',
        };
      } else {
        return {
          position: 'end',
        };
      }
    })();
    const order = calculateOrderForArtifactTreeNode({
      treeYKV: treeYKV,
      parentNodeId: target.item.getId(),
      location,
    });
    workspaceOrUserTreeConnection.yjsDoc.transact(() => {
      for (const itemId of itemIds) {
        let parentNodeId: string | null = target.item.getId();
        if (parentNodeId === UNCATEGORIZED_TREE_NODE_ID) {
          treeYKV.delete(itemId);
          continue;
        }

        if (parentNodeId === 'root') parentNodeId = null;
        treeYKV.set(itemId, {
          parentNodeId,
          order,
        });
      }
    });
  };

  const getAllParentsOf = (itemId: string): string[] => {
    const treeItem = treeItemsById.get(itemId);
    if (!treeItem) return [];
    if (!treeItem.parentId || treeItem.parentId === ROOT_TREE_NODE_ID)
      return [];

    return [treeItem.parentId, ...getAllParentsOf(treeItem.parentId)];
  };

  const focusedArtifactId: string | undefined =
    focusedPane.currentView.component === PaneableComponent.Artifact
      ? focusedPane.currentView.props.id
      : undefined;
  useEffect(() => {
    if (!leftPaneArtifactTreeAutoExpandOnNavigate) return;
    if (!focusedArtifactId) return;

    const parents = getAllParentsOf(focusedArtifactId);

    const set = new Set(expandedItemsRef.current);
    for (const parent of parents) {
      set.add(parent);
    }
    set.add(focusedArtifactId);
    setExpandedItems([...set]);
  }, [focusedPane.currentView.navigationEventId]);

  const tree = useTree({
    state: {
      expandedItems,
      selectedItems,
    },
    setSelectedItems,
    dataLoader: {
      getItem: (itemId) => {
        return treeItemsById.get(itemId);
      },
      getChildren: (itemId) => {
        return itemIdsByParentId.get(itemId) || [];
      },
    },
    isItemFolder: () => {
      // We allow dropping on any item
      return true;
    },
    getItemName: (item) => {
      return treeItemsById.get(item.getId())?.title || '';
    },
    rootItemId: ROOT_TREE_NODE_ID,
    features: [syncDataLoaderFeature, dragAndDropFeature, hotkeysCoreFeature],
    canReorder: true,
    onDrop: (items, target) => {
      onDrop(
        items.map((el) => el.getId()),
        target,
      );
    },
    canDropForeignDragObject: () => {
      return !!getCustomDragData();
    },
    onDropForeignDragObject: (_, target) => {
      // This is to support receiving drags from flexlayout-react
      const customDragData = getCustomDragData();
      if (!customDragData) return;

      if (
        customDragData.component !== PaneableComponent.Artifact ||
        !('id' in customDragData.props)
      )
        return;

      onDrop([customDragData.props.id], target);
    },
    createForeignDragObject: (items) => {
      // This is to support dragging into flexlayout-react
      const firstItemId = items.at(0)?.getId();
      if (firstItemId && firstItemId !== UNCATEGORIZED_TREE_NODE_ID) {
        setCustomDragData({
          component: PaneableComponent.Artifact,
          props: {
            id: items[0].getId(),
          },
        });
      }

      return {
        format: 'text/plain',
        data: `feynoteDrag:${JSON.stringify({
          type: 'treeIds',
          treeIds: items.map((item) => item.getId()),
        })}`,
      };
    },
  });

  useEffect(() => {
    tree.rebuildTree();
  }, [treeItemsById]);

  /**
   * Uncategorize all descendants of the itemsToDelete
   */
  const _recursiveDelete = (itemsIdsToDelete: string[]) => {
    for (const id of itemsIdsToDelete) {
      treeYKV.delete(id);

      const children = Array.from(itemIdsByParentId.get(id) || []);
      if (children?.length) {
        _recursiveDelete(children);
      }
    }
  };

  const onItemBodyFirstClick = (
    event: MouseEvent,
    itemInstance: ItemInstance<InternalTreeItem | undefined>,
  ) => {
    const item = treeItemsById.get(itemInstance.getId());
    if (!item) {
      console.error('Item that does not exist in tree was somehow clicked');
      return;
    }

    if (props.onNodeClicked) {
      props.onNodeClicked({
        parentId: item.parentId || 'root',
        targetId: item.id,
        treeId: props.treeId,
      });
    }

    if (props.mode === 'select') {
      return;
    }

    if (item.id === UNCATEGORIZED_TREE_NODE_ID) {
      // We ignore clicks on uncategorized because it's not navigable
      return;
    }

    navigateWithKeyboardHandler(event, PaneableComponent.Artifact, {
      id: item.id,
    });
  };

  const onItemBodyDoubleClick = (
    _event: MouseEvent,
    itemInstance: ItemInstance<InternalTreeItem | undefined>,
  ) => {
    const item = treeItemsById.get(itemInstance.getId());
    if (!item) {
      console.error('Item that does not exist in tree was somehow clicked');
      return;
    }

    setExpandedItems(
      Array.from(new Set([...expandedItemsRef.current, item.id])),
    );
  };

  const parentRef = useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: tree.getItems().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    paddingEnd: 75,
  });

  return (
    <TreeContainer ref={parentRef}>
      <TreeVirtualizer
        {...tree.getContainerProps()}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const itemInstance = tree.getItems()[virtualItem.index];
          return (
            <ArtifactTreeItem
              key={itemInstance.getId()}
              itemInstance={itemInstance}
              virtualizer={virtualizer}
              virtualItemInstance={virtualItem}
              treeItemsById={treeItemsById}
              itemIdsByParentId={itemIdsByParentId}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              enableContextMenu={props.enableItemContextMenu}
              onBodyFirstClick={(event) =>
                onItemBodyFirstClick(event, itemInstance)
              }
              onBodyDoubleClick={(event) =>
                onItemBodyDoubleClick(event, itemInstance)
              }
              isActive={focusedArtifactId === itemInstance.getId()}
            />
          );
        })}
        <DragLine style={tree.getDragLineStyle()} />
      </TreeVirtualizer>
    </TreeContainer>
  );
};
