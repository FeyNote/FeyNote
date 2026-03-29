import styled from 'styled-components';

import { InternalTreeItem, UNCATEGORIZED_TREE_NODE_ID } from './ArtifactTree';
import { ArtifactTreeItemContextMenu } from './ArtifactTreeItemContextMenu';
import {
  ArtifactTreeMultiSelectContextMenu,
  type MultiSelectAction,
} from './ArtifactTreeMultiSelectContextMenu';
import { getAllChildIdsForTreeItem } from '../../utils/artifactTree/getAllChildIdsForTreeItem';
import { IoChevronDown, IoChevronForward } from '../AppIcons';
import { ItemInstance } from '@headless-tree/core';
import { VirtualItem, type Virtualizer } from '@tanstack/react-virtual';
import { MouseEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSingleDoubleClick } from '../../utils/useSingleDoubleClick';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import type { WorkspaceSnapshot } from '@feynote/global-types';
import { WorkspaceBadges } from '../workspace/WorkspaceBadges';

export const TreeListItem = styled.li<{
  $isDragTarget: boolean;
  $isUncategorized: boolean;
}>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  font-size: 0.8rem;
  list-style-type: none;
  padding: 0;
  margin: 0;

  transition: background-color 0s 80ms;

  ${({ $isDragTarget }) =>
    $isDragTarget &&
    `
    background-color: var(--accent-a5);
    transition: background-color 0s 0s;

    div {
      background-color: transparent;
    }
  `}
`;

export const TreeItemContainer = styled.div<{
  $isUncategorized: boolean;
  $isActive: boolean;
  $isSelected: boolean;
}>`
  display: flex;
  align-items: center;
  padding-left: 2px;
  border-radius: 5px;
  transition: var(--background-hover-transition);

  ${(props) =>
    props.$isSelected &&
    `
    outline: 1.5px solid var(--accent-9);
    outline-offset: -1.5px;
  `}

  ${(props) =>
    props.$isActive &&
    `
    background-color: var(--contrasting-element-background-active);
  `}

  ${(props) =>
    !props.$isUncategorized &&
    `
    [data-dragging="false"] &:hover {
      background-color: var(--contrasting-element-background-hover);
    }
  `}
`;

export const ItemArrow = styled.div`
  width: 28px;
  height: 26px;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: var(--background-hover-transition);

  &:hover {
    background-color: var(--contrasting-element-background);
  }
`;

export const ItemArrowPlaceholder = styled.div`
  width: 28px;
  height: 26px;
  flex-shrink: 0;
`;

export const TreeLevelSink = styled.div`
  margin-left: 16px;
  border-left: 1px solid var(--contrasting-element-background-active);
`;

export const TreeItemButton = styled.button<{
  $isUncategorized: boolean;
}>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;

  flex-grow: 1;
  background-color: transparent;
  height: 32px;
  color: var(--text-color);
  outline: none;
  padding-left: 4px;
  padding-right: 8px;

  ${(props) =>
    props.$isUncategorized &&
    `
    cursor: default;
  `}

  ${(props) =>
    !props.$isUncategorized &&
    `
    cursor: pointer;
  `}
`;

export const HiddenDocumentText = styled.span`
  opacity: 0.4;
  font-style: italic;
`;

interface ArtifactTreeItemProps {
  itemInstance: ItemInstance<InternalTreeItem | undefined>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualItemInstance: VirtualItem;
  treeItemsById: Map<string, InternalTreeItem>;
  itemIdsByParentId: Map<string | null, string[]>;
  isActive: boolean;
  isSelected: boolean;
  selectedCount: number;
  onMultiSelectAction: (action: MultiSelectAction) => void;
  expandedItems: string[];
  setExpandedItems: (expandedItems: string[]) => void;
  enableContextMenu: boolean;
  onBodyFirstClick: (event: MouseEvent) => void;
  onBodyDoubleClick: (event: MouseEvent) => void;
}

export const ArtifactTreeItem: React.FC<ArtifactTreeItemProps> = (props) => {
  const item = props.treeItemsById.get(props.itemInstance.getId());
  const { t } = useTranslation();
  const { currentWorkspaceId } = useCurrentWorkspaceId();
  const { getWorkspaceIdsForArtifactId, getWorkspaceSnapshotById } =
    useWorkspaceSnapshots();

  const workspaceSnapshotsForItem = useMemo(() => {
    if (currentWorkspaceId) return []; // We do not show badges when a workspace is active
    if (!item || item.id === UNCATEGORIZED_TREE_NODE_ID) return [];
    const workspaceIds = getWorkspaceIdsForArtifactId(item.id);
    return workspaceIds
      .map((id) => getWorkspaceSnapshotById(id))
      .filter(
        (workspace): workspace is NonNullable<WorkspaceSnapshot> =>
          !!workspace && !workspace.meta.deletedAt,
      );
  }, [
    currentWorkspaceId,
    item?.id,
    getWorkspaceIdsForArtifactId,
    getWorkspaceSnapshotById,
  ]);

  const { onClick, onDoubleClick } = useSingleDoubleClick(
    undefined,
    props.onBodyDoubleClick,
    props.onBodyFirstClick,
  );

  const setExpanded = (expanded: boolean) => {
    const expandedItems = new Set(props.expandedItems);
    if (expanded) {
      expandedItems.add(props.itemInstance.getId());
    } else {
      expandedItems.delete(props.itemInstance.getId());
    }

    props.setExpandedItems(Array.from(expandedItems));
  };

  const expandAll = () => {
    if (!item) return;
    const expandedItems = new Set(props.expandedItems);
    expandedItems.add(props.itemInstance.getId());

    const childIds = getAllChildIdsForTreeItem(
      props.treeItemsById,
      props.itemIdsByParentId,
      item,
      0,
    );
    for (const childId of childIds) {
      expandedItems.add(childId);
    }
    props.setExpandedItems(Array.from(expandedItems));
  };

  const collapseAll = () => {
    if (!item) return;
    const expandedItems = new Set(props.expandedItems);
    expandedItems.delete(props.itemInstance.getId());

    const childIds = getAllChildIdsForTreeItem(
      props.treeItemsById,
      props.itemIdsByParentId,
      item,
      0,
    );
    for (const childId of childIds) {
      expandedItems.delete(childId);
    }
    props.setExpandedItems(Array.from(expandedItems));
  };

  if (!item) {
    // When removing an item from the tree there is a render before the virtualized
    // list removes the item that this component will be renderered
    return null;
  }

  const renderSink = (content: React.ReactNode) => {
    return <TreeLevelSink>{content}</TreeLevelSink>;
  };

  const renderContents = () => {
    if (item.isHidden) {
      let hiddenContent: React.ReactNode = (
        <TreeItemContainer
          data-index={props.virtualItemInstance.index}
          ref={props.virtualizer.measureElement}
          $isUncategorized={false}
          $isActive={false}
          $isSelected={false}
        >
          {props.itemIdsByParentId.get(item.id)?.length ? (
            <ItemArrow
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!props.itemInstance.isExpanded());
              }}
            >
              {props.itemInstance.isExpanded() ? (
                <IoChevronDown size={16} />
              ) : (
                <IoChevronForward size={16} />
              )}
            </ItemArrow>
          ) : (
            <ItemArrowPlaceholder />
          )}
          <TreeItemButton $isUncategorized={true}>
            <HiddenDocumentText>
              {t('artifactTree.hiddenDocument')}
            </HiddenDocumentText>
          </TreeItemButton>
        </TreeItemContainer>
      );
      for (let i = 0; i < props.itemInstance.getItemMeta().level; i++) {
        hiddenContent = renderSink(hiddenContent);
      }
      return hiddenContent;
    }

    const isMultiSelected = props.isSelected && props.selectedCount > 1;

    const treeItemContent = (
      <TreeItemContainer
        data-index={props.virtualItemInstance.index}
        ref={props.virtualizer.measureElement}
        $isUncategorized={item.id === UNCATEGORIZED_TREE_NODE_ID}
        $isActive={props.isActive}
        $isSelected={props.isSelected}
      >
        {props.itemIdsByParentId.get(item.id)?.length ? (
          <ItemArrow
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!props.itemInstance.isExpanded());
            }}
          >
            {props.itemInstance.isExpanded() ? (
              <IoChevronDown size={16} />
            ) : (
              <IoChevronForward size={16} />
            )}
          </ItemArrow>
        ) : (
          <ItemArrowPlaceholder />
        )}
        <TreeItemButton
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          $isUncategorized={item.id === UNCATEGORIZED_TREE_NODE_ID}
        >
          {item.title}
          <WorkspaceBadges workspaceSnapshots={workspaceSnapshotsForItem} />
        </TreeItemButton>
      </TreeItemContainer>
    );

    const innerContent = isMultiSelected ? (
      <ArtifactTreeMultiSelectContextMenu
        enabled={props.enableContextMenu}
        selectedCount={props.selectedCount}
        onAction={props.onMultiSelectAction}
      >
        {treeItemContent}
      </ArtifactTreeMultiSelectContextMenu>
    ) : (
      <ArtifactTreeItemContextMenu
        enabled={
          props.enableContextMenu && item.id !== UNCATEGORIZED_TREE_NODE_ID
        }
        artifactId={item.id}
        paneId={undefined}
        expandAll={expandAll}
        collapseAll={collapseAll}
      >
        {treeItemContent}
      </ArtifactTreeItemContextMenu>
    );

    let previousContent = innerContent;
    for (let i = 0; i < props.itemInstance.getItemMeta().level; i++) {
      previousContent = renderSink(previousContent);
    }
    return previousContent;
  };

  const itemProps = props.itemInstance.getProps();
  const originalOnClick = itemProps.onClick;

  return (
    <TreeListItem
      {...itemProps}
      onClick={(e: React.MouseEvent) => {
        if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
          return;
        }
        originalOnClick?.(e);
      }}
      $isUncategorized={
        props.itemInstance.getId() === UNCATEGORIZED_TREE_NODE_ID
      }
      $isDragTarget={props.itemInstance.isDragTarget()}
      style={{
        transform: `translateY(${props.virtualItemInstance.start}px)`,
      }}
    >
      {renderContents()}
    </TreeListItem>
  );
};
