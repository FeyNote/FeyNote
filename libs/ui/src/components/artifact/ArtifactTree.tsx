import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { YKeyValue } from 'y-utility/y-keyvalue';
import {
  ControlledTreeEnvironment,
  InteractionMode,
  Tree,
  TreeItem,
  TreeItemIndex,
  type DraggingPositionBetweenItems,
  type DraggingPositionItem,
  type DraggingPositionRoot,
} from 'react-complex-tree';
import styled from 'styled-components';
import { t } from 'i18next';
import * as Sentry from '@sentry/react';

import { useSessionContext } from '../../context/session/SessionContext';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { PreferenceNames } from '@feynote/shared-utils';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { usePreferencesContext } from '../../context/preferences/PreferencesContext';
import { ArtifactTreeItem } from './ArtifactTreeItem';
import {
  CustomDragStateData,
  getCustomDragData,
  registerStartTreeDrag,
  setCustomDragData,
} from '../../utils/artifactTree/customDrag';
import { calculateOrderForArtifactTreeNode } from '../../utils/artifactTree/calculateOrderForArtifactTreeNode';
import { useCollaborationConnection } from '../../utils/collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../../utils/localDb/artifactSnapshots/useArtifactSnapshots';

const StyleContainer = styled.div`
  .rct-tree-root {
    padding-top: 4px;
    padding-bottom: 4px;
    padding-right: 4px;
  }

  .rct-tree-items-container {
    margin: 0;
    padding: 0;
  }

  .rct-tree-items-container .rct-tree-items-container {
    margin-left: 20px;
  }

  .rct-tree-drag-between-line {
    position: absolute;
    right: 0;
    top: -3px;
    height: 6px;

    background-color: var(--ion-color-primary);
  }

  .rct-tree-drag-between-line-top {
    top: 0;
  }

  .rct-tree-drag-between-line-bottom {
    top: -4px;
  }
`;

export interface InternalTreeItem {
  id: string;
  title: string;
  order: string;
  draggable?: boolean;
}

export const ROOT_TREE_NODE_ID = 'root';
export const UNCATEGORIZED_TREE_NODE_ID = 'uncategorized';

type ExcludedMinimalDraggingPositionKeys = 'linearIndex' | 'depth';
/**
 * Implements only a subset of the information in the normal DraggingPosition interface
 */
type MinimalDraggingPosition =
  | Omit<DraggingPositionItem, ExcludedMinimalDraggingPositionKeys>
  | Omit<DraggingPositionBetweenItems, ExcludedMinimalDraggingPositionKeys>
  | Omit<DraggingPositionRoot, ExcludedMinimalDraggingPositionKeys>;

interface Props {
  treeId: string; // This should be globally unique!
  registerAsGlobalTreeDragHandler: boolean; // This should only be enabled for the sidemenu tree
  editable: boolean;
  mode: 'navigate' | 'select';
  enableItemContextMenu: boolean;
  onNodeClicked?: (pos: MinimalDraggingPosition) => void;
  onDropRef?: RefObject<
    (
      droppedItems: TreeItem<InternalTreeItem>[],
      target: MinimalDraggingPosition,
    ) => void
  >;
}

export const ArtifactTree: React.FC<Props> = (props) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const { session } = useSessionContext();
  const { getPreference } = usePreferencesContext();
  const leftPaneArtifactTreeShowUncategorized = getPreference(
    PreferenceNames.LeftPaneArtifactTreeShowUncategorized,
  );
  const { artifactSnapshots } = useArtifactSnapshots();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const expandedItemsRef = useRef(expandedItems);
  expandedItemsRef.current = expandedItems;
  const setExpandedItemsRef = useRef(setExpandedItems);
  setExpandedItemsRef.current = setExpandedItems;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { navigate } = useContext(GlobalPaneContext);

  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const yDoc = connection.yjsDoc;

  const yKeyValue = useMemo(() => {
    const yArray = yDoc.getArray<{
      key: string;
      val: {
        parentNodeId: string | null;
        order: string;
      };
    }>('treeNodes');
    const yKeyValue = new YKeyValue<{
      parentNodeId: string | null;
      order: string;
    }>(yArray);

    return yKeyValue;
  }, [yDoc]);

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };
    yKeyValue.on('change', listener);

    return () => {
      yKeyValue.off('change', listener);
    };
  }, [yKeyValue]);

  const items = useMemo((): Record<
    TreeItemIndex,
    TreeItem<InternalTreeItem>
  > => {
    const artifactsById = new Map(
      artifactSnapshots?.map((artifact) => [artifact.id, artifact]),
    );

    const kvEntries = new Map(yKeyValue.yarray.map((el) => [el.key, el.val]));

    const items: Record<TreeItemIndex, TreeItem<InternalTreeItem>> = {};

    // Build tree nodes
    for (const [key, value] of kvEntries) {
      const artifact = artifactsById.get(key);
      if (!artifact) {
        // Artifact appears to be deleted, do not render but also do not remove from kvlist in case it comes back
        // (re-shared to user)
        continue;
      }

      items[key] = {
        index: key,
        data: {
          id: key,
          title: artifact.meta.title,
          order: value.order,
        },
        children: [],
        isFolder: false,
      };
    }

    // Artifact not explicitly added to tree, add it to uncategorized
    const uncategorizedArtifacts = new Set<string>();
    for (const artifact of artifactSnapshots || []) {
      if (!items[artifact.id]) {
        items[artifact.id] = {
          index: artifact.id,
          data: {
            id: artifact.id,
            title: artifact.meta.title,
            order: 'Z',
          },
          children: [],
          isFolder: false,
        };

        uncategorizedArtifacts.add(artifact.id);
      }
    }

    // Populate children
    for (const [key, value] of kvEntries) {
      // We may have hanging items in our kvlist that aren't accessible to us anymore
      if (!items[key]) continue;

      // Find item which this item is a child of, and add to the parent item's children list
      // enabling folder mode for the parent item
      if (value.parentNodeId && items[value.parentNodeId]) {
        items[value.parentNodeId].children?.push(key);
        items[value.parentNodeId].isFolder = true;
      }

      // Parents for nodes may be deleted, unshared, or otherwise invalid.
      // We don't want them to be permanently unavailable in the tree
      if (value.parentNodeId && !items[value.parentNodeId]) {
        uncategorizedArtifacts.add(key);
      }
    }

    if (leftPaneArtifactTreeShowUncategorized) {
      // All uncategorized items go under their own header
      items[UNCATEGORIZED_TREE_NODE_ID] = {
        index: UNCATEGORIZED_TREE_NODE_ID,
        data: {
          id: UNCATEGORIZED_TREE_NODE_ID,
          title: t('artifactTree.uncategorized', {
            count: uncategorizedArtifacts.size,
          }),
          order: 'XZ',
        },
        children: Array.from(uncategorizedArtifacts),
        isFolder: true,
        canMove: false,
      };
    }

    // Sort children
    for (const key in items) {
      items[key].children = items[key].children?.sort((a, b) => {
        const aItem = items[a];
        const bItem = items[b];

        const comparison = aItem.data.order.localeCompare(bItem.data.order);
        if (comparison === 0) {
          const titleComparison = aItem.data.title.localeCompare(
            bItem.data.title,
          );
          if (comparison === 0) {
            return aItem.data.id.localeCompare(bItem.data.id);
          }
          return titleComparison;
        }
        return comparison;
      });
    }

    // Create root node
    items[ROOT_TREE_NODE_ID] = {
      index: ROOT_TREE_NODE_ID,
      data: {
        id: ROOT_TREE_NODE_ID,
        title: 'Root',
        order: 'A',
      },
      // Children should be anything that has no parent item found in our collection
      children: Object.entries(items)
        .filter(([key]) => {
          // We always want the list of uncategorized artifacts at the root
          if (key === UNCATEGORIZED_TREE_NODE_ID) return true;

          const kvEntry = kvEntries.get(key);

          // 'null' is the root node, so this element belongs at root
          if (kvEntry?.parentNodeId === null) return true;

          return false;
        })
        .sort(([_, aVal], [__, bVal]) => {
          const comparison = aVal.data.order.localeCompare(bVal.data.order);
          if (comparison === 0) {
            return aVal.data.title.localeCompare(bVal.data.title);
          }
          return comparison;
        })
        .map(([key]) => key),
    };

    return items;
  }, [
    yKeyValue,
    _rerenderReducerValue,
    leftPaneArtifactTreeShowUncategorized,
    artifactSnapshots,
  ]);
  const itemsRef = useRef<Record<TreeItemIndex, TreeItem<InternalTreeItem>>>(
    {},
  );
  itemsRef.current = items;

  /**
   * Uncategorize all descendants of the itemsToDelete
   */
  const recursiveDelete = (itemsToDelete: TreeItem<InternalTreeItem>[]) => {
    for (const itemToDelete of itemsToDelete) {
      yKeyValue.delete(itemToDelete.data.id);

      const children = itemToDelete.children?.map(
        (child) => items[child.toString()],
      );
      if (children?.length) {
        recursiveDelete(children);
      }
    }
  };

  const onDrop = (
    droppedItems: TreeItem<InternalTreeItem>[],
    target: MinimalDraggingPosition,
  ) => {
    if (target.targetType === 'root') {
      for (const item of droppedItems) {
        const order = calculateOrderForArtifactTreeNode({
          treeYKV: yKeyValue,
          parentNodeId: ROOT_TREE_NODE_ID,
          location: {
            position: 'end',
          },
        });

        yKeyValue.set(item.data.id, {
          parentNodeId: null,
          order,
        });
      }
    }
    if (target.targetType === 'item') {
      if (isItemUncategorized(target.targetItem.toString())) {
        // This is unexpected since we should have already prevented this in canDropAt
        const error = new Error('Cannot drop on uncategorized');
        console.error(error);
        Sentry.captureException(error);
        return;
      }

      if (target.targetItem.toString() === UNCATEGORIZED_TREE_NODE_ID) {
        recursiveDelete(droppedItems);

        return;
      }

      for (const item of droppedItems) {
        const order = calculateOrderForArtifactTreeNode({
          treeYKV: yKeyValue,
          parentNodeId: target.targetItem.toString(),
          location: {
            position: 'end',
          },
        });

        yKeyValue.set(item.data.id, {
          parentNodeId:
            target.targetItem.toString() === ROOT_TREE_NODE_ID
              ? null
              : target.targetItem.toString(),
          order,
        });
      }
    }
    if (target.targetType === 'between-items') {
      if (isItemUncategorized(target.parentItem.toString())) {
        // This is unexpected since we should have already prevented this in canDropAt
        const error = new Error('Cannot drop between uncategorized items');
        console.error(error);
        Sentry.captureException(error);
        return;
      }

      if (target.parentItem.toString() === UNCATEGORIZED_TREE_NODE_ID) {
        return;
      }

      const parentItem = items[target.parentItem];
      let previousItemId =
        items[parentItem.children?.[target.childIndex - 1] || -1]?.data.id;
      const nextItemId =
        items[parentItem.children?.[target.childIndex] || -1]?.data.id;

      for (const item of droppedItems) {
        const order = calculateOrderForArtifactTreeNode({
          treeYKV: yKeyValue,
          parentNodeId: target.parentItem.toString(),
          location: {
            position: 'between',
            afterNodeId: previousItemId,
            beforeNodeId: nextItemId,
          },
        });

        yKeyValue.set(item.data.id, {
          parentNodeId:
            target.parentItem.toString() === ROOT_TREE_NODE_ID
              ? null
              : target.parentItem.toString(),
          order,
        });

        previousItemId = item.data.id;
      }
    }
  };
  if (props.onDropRef) {
    props.onDropRef.current = onDrop;
  }

  /**
   * Returns true if the item is uncategorized, but is not the uncategorized header itself
   */
  const isItemUncategorized = (index: string) => {
    if (index === UNCATEGORIZED_TREE_NODE_ID) {
      // Allow drop on "uncategorized" itself
      return false;
    }
    if (index === ROOT_TREE_NODE_ID) {
      // Always allow drop on root
      return false;
    }

    const kvEntry = yKeyValue.get(index);
    // When an item isn't in the kv list, it's de-facto uncategorized since it has no capability to have a parent
    if (!kvEntry) return true;

    // When an item's parent doesn't exist in our items list, the user has likely lost access to the parent or it's been deleted
    if (kvEntry.parentNodeId && !items[kvEntry.parentNodeId]) {
      return true;
    }

    return false;
  };

  return (
    <StyleContainer>
      <ControlledTreeEnvironment
        ref={(el) => {
          if (!props.registerAsGlobalTreeDragHandler) return;

          registerStartTreeDrag(() => {
            const customDragData = getCustomDragData();
            if (!customDragData) {
              throw new Error(
                'startTreeDrag was called without customDragData being set first',
              );
            }
            if (customDragData.component !== PaneableComponent.Artifact) {
              throw new Error(
                'startTreeDrag was called with an unexpected component',
              );
            }
            const { props: dragDataProps } =
              customDragData as CustomDragStateData<PaneableComponent.Artifact>;

            el?.dragAndDropContext.onStartDraggingItems(
              [
                {
                  index: dragDataProps.id,
                  children: [],
                  isFolder: false,
                  canMove: true,
                  canRename: false,
                  data: {
                    id: dragDataProps.id,
                    title:
                      artifactSnapshots?.find(
                        (artifact) => artifact.id === dragDataProps.id,
                      )?.meta.title || 'Unknown',
                    order: 'X',
                  } satisfies InternalTreeItem,
                },
              ],
              props.treeId,
            );
          });
        }}
        items={items}
        getItemTitle={(item) => item.data.title}
        viewState={{
          [props.treeId]: {
            expandedItems,
            selectedItems,
          },
        }}
        onExpandItem={(item) =>
          setExpandedItems([...expandedItems, item.index.toString()])
        }
        onCollapseItem={(item) =>
          setExpandedItems(
            expandedItems.filter(
              (expandedItemIndex) => expandedItemIndex !== item.index,
            ),
          )
        }
        onSelectItems={(items) =>
          setSelectedItems(items.map((item) => item.toString()))
        }
        defaultInteractionMode={{
          mode: 'custom',
          extends: InteractionMode.ClickArrowToExpand,
          createInteractiveElementProps: (
            item: TreeItem<InternalTreeItem>,
            treeId,
            actions,
          ) => ({
            onClick: (e) => {
              if (props.onNodeClicked) {
                const parentItem = Object.values(items).find((el) =>
                  el.children?.includes(item.index),
                );

                props.onNodeClicked({
                  targetType: 'item',
                  parentItem: parentItem?.index || 'root',
                  targetItem: item.index,
                  treeId,
                });
              }

              if (props.mode === 'select') {
                return;
              }

              if (item.index === UNCATEGORIZED_TREE_NODE_ID) {
                // We ignore clicks on uncategorized because it's not navigable
                // actions.toggleExpandedState();
                return;
              }

              if (e.ctrlKey || e.metaKey) {
                navigate(
                  undefined,
                  PaneableComponent.Artifact,
                  { id: item.data.id },
                  PaneTransition.NewTab,
                  true,
                );
              } else {
                navigate(
                  undefined,
                  PaneableComponent.Artifact,
                  { id: item.data.id },
                  PaneTransition.Push,
                  true,
                );
              }
            },
            onDragStart: () => {
              setCustomDragData({
                component: PaneableComponent.Artifact,
                props: {
                  id: item.data.id,
                },
              });
              actions.startDragging();
            },
          }),
        }}
        canDropAt={(item, target) => {
          if (target.targetType === 'item') {
            return !isItemUncategorized(target.targetItem.toString());
          }
          if (target.targetType === 'between-items') {
            return (
              target.parentItem.toString() !== UNCATEGORIZED_TREE_NODE_ID &&
              !isItemUncategorized(target.parentItem.toString())
            );
          }

          return true;
        }}
        canDragAndDrop={props.editable}
        canDropOnFolder
        canReorderItems
        canDropOnNonFolder
        onDrop={onDrop}
        renderItem={(treeRenderProps) => {
          return (
            <ArtifactTreeItem
              treeRenderProps={treeRenderProps}
              itemsRef={itemsRef}
              expandedItemsRef={expandedItemsRef}
              setExpandedItemsRef={setExpandedItemsRef}
              enableContextMenu={props.enableItemContextMenu}
            />
          );
        }}
      >
        <Tree treeId={props.treeId} rootItem={ROOT_TREE_NODE_ID} />
      </ControlledTreeEnvironment>
    </StyleContainer>
  );
};
