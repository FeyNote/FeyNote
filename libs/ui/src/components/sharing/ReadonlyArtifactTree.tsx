import { useEffect, useMemo, useRef, useState } from 'react';
import { hotkeysCoreFeature, syncDataLoaderFeature } from '@headless-tree/core';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTree } from '@headless-tree/react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { Doc as YDoc } from 'yjs';
import type { ArtifactSnapshot } from '@feynote/global-types';
import {
  getWorkspaceTreeNodesFromYDoc,
  getWorkspaceArtifactsFromYDoc,
} from '@feynote/shared-utils';
import { IoChevronDown, IoChevronForward } from '../AppIcons';
import {
  ROOT_TREE_NODE_ID,
  UNCATEGORIZED_TREE_NODE_ID,
  UNCATEGORIZED_CHILD_INDEX,
  type InternalTreeItem,
} from '../artifact/ArtifactTree';
import {
  TreeListItem,
  TreeItemContainer,
  ItemArrow,
  TreeLevelSink,
  TreeItemButton,
  HiddenDocumentText,
} from '../artifact/ArtifactTreeItem';

const TreeContainer = styled.div`
  height: 100%;
  overflow: auto;
`;

const TreeVirtualizer = styled.div`
  width: 100%;
  position: relative;
`;

interface Props {
  workspaceYDoc: YDoc;
  artifactSnapshots: ArtifactSnapshot[];
  selectedArtifactId: string | null;
  onSelectArtifact: (id: string) => void;
}

export const ReadonlyArtifactTree: React.FC<Props> = (props) => {
  const { t } = useTranslation();
  const parentRef = useRef<HTMLDivElement | null>(null);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const { treeItemsById, itemIdsByParentId } = useMemo(() => {
    const treeNodesYKV = getWorkspaceTreeNodesFromYDoc(props.workspaceYDoc);
    const artifactIdsYKV = getWorkspaceArtifactsFromYDoc(props.workspaceYDoc);
    const workspaceArtifactIds = new Set(
      artifactIdsYKV.yarray.toArray().map((el) => el.key),
    );

    const artifactSnapshotsById = new Map(
      props.artifactSnapshots.map((s) => [s.id, s]),
    );

    const treeItemsById = new Map<string, InternalTreeItem>();

    for (const entry of treeNodesYKV.yarray.toArray()) {
      const { key, val } = entry;

      if (!workspaceArtifactIds.has(key)) continue;

      let order = val.order;
      if (val.parentNodeId === UNCATEGORIZED_TREE_NODE_ID) {
        order = UNCATEGORIZED_CHILD_INDEX;
      }

      const artifactSnapshot = artifactSnapshotsById.get(key);
      if (!artifactSnapshot) {
        treeItemsById.set(key, {
          id: key,
          title: t('artifactTree.hiddenDocument'),
          order,
          parentId: val.parentNodeId || ROOT_TREE_NODE_ID,
          isHidden: true,
        });
        continue;
      }

      treeItemsById.set(key, {
        id: key,
        title: artifactSnapshot.meta.title,
        order,
        parentId: val.parentNodeId || ROOT_TREE_NODE_ID,
      });
    }

    for (const artifact of props.artifactSnapshots) {
      if (treeItemsById.has(artifact.id)) continue;
      treeItemsById.set(artifact.id, {
        id: artifact.id,
        title: artifact.meta.title,
        order: UNCATEGORIZED_CHILD_INDEX,
        parentId: UNCATEGORIZED_TREE_NODE_ID,
      });
    }

    let uncategorizedItemRef: InternalTreeItem | null = null;
    uncategorizedItemRef = {
      id: UNCATEGORIZED_TREE_NODE_ID,
      title: t('artifactTree.uncategorized', { count: 0 }),
      order: treeNodesYKV.get(UNCATEGORIZED_TREE_NODE_ID)?.order || 'XY',
      parentId: ROOT_TREE_NODE_ID,
    };
    treeItemsById.set(UNCATEGORIZED_TREE_NODE_ID, uncategorizedItemRef);

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
        if (seenIds.has(itemId)) return;
        seenIds.add(itemId);
        const item = treeItemsById.get(itemId);
        if (!item) return;
        if (item.id !== UNCATEGORIZED_TREE_NODE_ID) uncategorizedCount++;
        for (const id of _itemIdsByParentId.get(itemId) || []) {
          countUncategorizedItems(id);
        }
      };
      countUncategorizedItems(UNCATEGORIZED_TREE_NODE_ID);

      if (uncategorizedCount === 0) {
        treeItemsById.delete(UNCATEGORIZED_TREE_NODE_ID);
      } else {
        uncategorizedItemRef.title = t('artifactTree.uncategorized', {
          count: uncategorizedCount,
        });
      }
    }

    const itemIdsByParentId = getItemIdsByParentId();

    const visibilityCache = new Map<string, boolean>();
    const hasVisibleDescendant = (itemId: string): boolean => {
      const cached = visibilityCache.get(itemId);
      if (cached !== undefined) return cached;
      visibilityCache.set(itemId, false);
      for (const childId of itemIdsByParentId.get(itemId) || []) {
        const child = treeItemsById.get(childId);
        if (!child) continue;
        if (!child.isHidden || hasVisibleDescendant(childId)) {
          visibilityCache.set(itemId, true);
          return true;
        }
      }
      return false;
    };

    for (const [id, item] of treeItemsById) {
      if (!item.isHidden) continue;
      if (hasVisibleDescendant(id)) continue;
      const siblings = itemIdsByParentId.get(item.parentId);
      if (siblings) {
        const idx = siblings.indexOf(id);
        if (idx !== -1) siblings.splice(idx, 1);
      }
      treeItemsById.delete(id);
    }

    treeItemsById.set(ROOT_TREE_NODE_ID, {
      id: ROOT_TREE_NODE_ID,
      title: 'Root',
      order: 'X',
      parentId: null,
    });

    return { treeItemsById, itemIdsByParentId };
  }, [props.workspaceYDoc, props.artifactSnapshots, t]);

  const treeIsEmpty = useMemo(() => {
    for (const key of treeItemsById.keys()) {
      if (key !== ROOT_TREE_NODE_ID && key !== UNCATEGORIZED_TREE_NODE_ID) {
        return false;
      }
    }
    return true;
  }, [treeItemsById]);

  const getAllParentsOf = (itemId: string): string[] => {
    const treeItem = treeItemsById.get(itemId);
    if (!treeItem) return [];
    if (!treeItem.parentId || treeItem.parentId === ROOT_TREE_NODE_ID)
      return [];
    return [treeItem.parentId, ...getAllParentsOf(treeItem.parentId)];
  };

  useEffect(() => {
    if (!props.selectedArtifactId) return;

    const parents = getAllParentsOf(props.selectedArtifactId);
    const set = new Set(expandedItems);
    for (const parent of parents) {
      set.add(parent);
    }
    set.add(props.selectedArtifactId);
    setExpandedItems([...set]);
  }, [props.selectedArtifactId]);

  useEffect(() => {
    if (props.selectedArtifactId !== null || treeIsEmpty) return;

    const findFirstAccessible = (parentId: string): string | undefined => {
      for (const childId of itemIdsByParentId.get(parentId) ?? []) {
        const item = treeItemsById.get(childId);
        if (!item) continue;
        if (!item.isHidden && childId !== UNCATEGORIZED_TREE_NODE_ID) {
          return childId;
        }
        const descendant = findFirstAccessible(childId);
        if (descendant) return descendant;
      }
      return undefined;
    };

    const firstAccessible = findFirstAccessible(ROOT_TREE_NODE_ID);
    if (firstAccessible) {
      props.onSelectArtifact(firstAccessible);
    }
  }, [treeItemsById, itemIdsByParentId, props.selectedArtifactId, treeIsEmpty]);

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
    isItemFolder: () => true,
    getItemName: (item) => {
      return treeItemsById.get(item.getId())?.title || '';
    },
    rootItemId: ROOT_TREE_NODE_ID,
    features: [syncDataLoaderFeature, hotkeysCoreFeature],
  });

  useEffect(() => {
    tree.rebuildTree();
  }, [treeItemsById]);

  const virtualizer = useVirtualizer({
    count: tree.getItems().length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 32,
    paddingEnd: 75,
  });

  const onItemClick = (itemId: string) => {
    const item = treeItemsById.get(itemId);
    if (!item) return;
    if (item.isHidden || itemId === UNCATEGORIZED_TREE_NODE_ID) return;
    props.onSelectArtifact(itemId);
  };

  const renderSink = (content: React.ReactNode) => {
    return <TreeLevelSink>{content}</TreeLevelSink>;
  };

  return (
    <TreeContainer ref={parentRef}>
      <TreeVirtualizer
        {...tree.getContainerProps()}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {!treeIsEmpty &&
          virtualizer.getVirtualItems().map((virtualItem) => {
            const itemInstance = tree.getItems()[virtualItem.index];
            const item = treeItemsById.get(itemInstance.getId());
            if (!item) return null;

            const isUncategorized =
              itemInstance.getId() === UNCATEGORIZED_TREE_NODE_ID;
            const hasChildren =
              (itemIdsByParentId.get(itemInstance.getId()) ?? []).length > 0;

            const setExpanded = (expanded: boolean) => {
              const set = new Set(expandedItems);
              if (expanded) {
                set.add(itemInstance.getId());
              } else {
                set.delete(itemInstance.getId());
              }
              setExpandedItems(Array.from(set));
            };

            let innerContent: React.ReactNode;

            if (item.isHidden) {
              innerContent = (
                <TreeItemContainer
                  $isUncategorized={false}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                >
                  {hasChildren && (
                    <ItemArrow
                      onClick={() => setExpanded(!itemInstance.isExpanded())}
                    >
                      {itemInstance.isExpanded() ? (
                        <IoChevronDown size={16} />
                      ) : (
                        <IoChevronForward size={16} />
                      )}
                    </ItemArrow>
                  )}
                  <TreeItemButton $isUncategorized={true} $isActive={false}>
                    <HiddenDocumentText>
                      {t('artifactTree.hiddenDocument')}
                    </HiddenDocumentText>
                  </TreeItemButton>
                </TreeItemContainer>
              );
            } else {
              innerContent = (
                <TreeItemContainer
                  $isUncategorized={isUncategorized}
                  data-index={virtualItem.index}
                  ref={virtualizer.measureElement}
                >
                  {hasChildren && (
                    <ItemArrow
                      onClick={() => setExpanded(!itemInstance.isExpanded())}
                    >
                      {itemInstance.isExpanded() ? (
                        <IoChevronDown size={16} />
                      ) : (
                        <IoChevronForward size={16} />
                      )}
                    </ItemArrow>
                  )}
                  <TreeItemButton
                    onClick={() => onItemClick(itemInstance.getId())}
                    $isUncategorized={isUncategorized}
                    $isActive={
                      props.selectedArtifactId === itemInstance.getId()
                    }
                  >
                    {item.title}
                  </TreeItemButton>
                </TreeItemContainer>
              );
            }

            let rendered = innerContent;
            for (let i = 0; i < itemInstance.getItemMeta().level; i++) {
              rendered = renderSink(rendered);
            }

            return (
              <TreeListItem
                key={itemInstance.getId()}
                {...itemInstance.getProps()}
                $isDragTarget={false}
                $isUncategorized={isUncategorized}
                style={{
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                {rendered}
              </TreeListItem>
            );
          })}
      </TreeVirtualizer>
    </TreeContainer>
  );
};
