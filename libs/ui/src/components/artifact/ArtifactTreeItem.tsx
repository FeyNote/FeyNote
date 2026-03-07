import styled from 'styled-components';

import { InternalTreeItem, UNCATEGORIZED_TREE_NODE_ID } from './ArtifactTree';
import { ArtifactTreeItemContextMenu } from './ArtifactTreeItemContextMenu';
import { getAllChildIdsForTreeItem } from '../../utils/artifactTree/getAllChildIdsForTreeItem';
import { IoChevronDown, IoChevronForward, LuFolder } from '../AppIcons';
import { ItemInstance } from '@headless-tree/core';
import { VirtualItem, type Virtualizer } from '@tanstack/react-virtual';
import { MouseEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSingleDoubleClick } from '../../utils/useSingleDoubleClick';
import { useCurrentWorkspaceId } from '../../utils/workspace/useCurrentWorkspaceId';
import { useWorkspaceSnapshots } from '../../utils/localDb/workspaces/useWorkspaceSnapshots';
import { WORKSPACE_ICON_BY_ID } from '../workspace/workspaceConstants';
import type { WorkspaceSnapshot } from '@feynote/global-types';

const TreeListItem = styled.li<{
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

  ${({ $isDragTarget }) =>
    $isDragTarget &&
    `
    background-color: var(--ion-color-primary);
    color: var(--ion-color-primary);
  `}
`;

const TreeItemContainer = styled.div<{
  $isUncategorized: boolean;
}>`
  display: flex;
  align-items: center;
  padding-left: 10px;
`;

const ItemArrow = styled.div`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;

  &:hover {
    background-color: var(--card-background-hover);
  }
`;

const TreeLevelSink = styled.div`
  margin-left: 20px;
  border-left: 1px solid var(--card-background-active);
`;

const TreeItemButton = styled.button<{
  $isUncategorized: boolean;
  $isActive: boolean;
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
  border-radius: 5px;
  padding-left: 8px;
  padding-right: 8px;

  ${(props) =>
    props.$isActive &&
    `
    background-color: var(--card-background-active);
  `}

  ${(props) =>
    props.$isUncategorized &&
    `
    cursor: default;
  `}

  ${(props) =>
    !props.$isUncategorized &&
    `
    cursor: pointer;
    &:hover {
      background-color: var(--card-background-hover);
    }
  `}
`;

const WorkspaceBadge = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  min-width: 16px;
  border-radius: 50%;
  background-color: ${(props) => props.$color};
  opacity: 0.65;
  color: white;
  font-size: 9px;
  margin-left: 2px;
`;

const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 1px;
  margin-left: 4px;
  flex-shrink: 0;
`;

const OverflowBadge = styled.span`
  font-size: 9px;
  color: var(--text-color-dim);
  margin-left: 2px;
`;

const HiddenDocumentText = styled.span`
  opacity: 0.4;
  font-style: italic;
`;

const MAX_WORKSPACE_BADGES = 2;

interface ArtifactTreeItemProps {
  itemInstance: ItemInstance<InternalTreeItem | undefined>;
  virtualizer: Virtualizer<HTMLDivElement, Element>;
  virtualItemInstance: VirtualItem;
  treeItemsById: Map<string, InternalTreeItem>;
  itemIdsByParentId: Map<string | null, string[]>;
  isActive: boolean;
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
        >
          <TreeItemButton $isUncategorized={true} $isActive={false}>
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

    const innerContent = (
      <ArtifactTreeItemContextMenu
        enabled={
          props.enableContextMenu && item.id !== UNCATEGORIZED_TREE_NODE_ID
        }
        artifactId={item.id}
        paneId={undefined}
        expandAll={expandAll}
        collapseAll={collapseAll}
      >
        <TreeItemContainer
          data-index={props.virtualItemInstance.index}
          ref={props.virtualizer.measureElement}
          $isUncategorized={item.id === UNCATEGORIZED_TREE_NODE_ID}
        >
          {!!props.itemIdsByParentId.get(item.id)?.length && (
            <ItemArrow
              onClick={() => setExpanded(!props.itemInstance.isExpanded())}
            >
              {props.itemInstance.isExpanded() ? (
                <IoChevronDown size={16} />
              ) : (
                <IoChevronForward size={16} />
              )}
            </ItemArrow>
          )}
          <TreeItemButton
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            $isUncategorized={item.id === UNCATEGORIZED_TREE_NODE_ID}
            $isActive={props.isActive}
          >
            {item.title}
            {workspaceSnapshotsForItem.length > 0 && (
              <BadgeContainer>
                {workspaceSnapshotsForItem
                  .slice(0, MAX_WORKSPACE_BADGES)
                  .map((snapshot) => {
                    const Icon =
                      WORKSPACE_ICON_BY_ID.get(snapshot.meta.icon) || LuFolder;
                    return (
                      <WorkspaceBadge
                        key={snapshot.id}
                        $color={snapshot.meta.color}
                      >
                        <Icon />
                      </WorkspaceBadge>
                    );
                  })}
                {workspaceSnapshotsForItem.length > MAX_WORKSPACE_BADGES && (
                  <OverflowBadge>
                    +{workspaceSnapshotsForItem.length - MAX_WORKSPACE_BADGES}
                  </OverflowBadge>
                )}
              </BadgeContainer>
            )}
          </TreeItemButton>
        </TreeItemContainer>
      </ArtifactTreeItemContextMenu>
    );

    let previousContent = innerContent;
    for (let i = 0; i < props.itemInstance.getItemMeta().level; i++) {
      previousContent = renderSink(previousContent);
    }
    return previousContent;
  };

  return (
    <TreeListItem
      {...props.itemInstance.getProps()}
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
