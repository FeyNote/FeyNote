import styled from 'styled-components';

import { InternalTreeItem, UNCATEGORIZED_TREE_NODE_ID } from './ArtifactTree';
import { ArtifactTreeItemContextMenu } from './ArtifactTreeItemContextMenu';
import { getAllChildIdsForTreeItem } from '../../utils/artifactTree/getAllChildIdsForTreeItem';
import { IoChevronDown, IoChevronForward } from '../AppIcons';
import { ItemInstance } from '@headless-tree/core';
import { VirtualItem, type Virtualizer } from '@tanstack/react-virtual';
import { MouseEvent } from 'react';
import { useSingleDoubleClick } from '../../utils/useSingleDoubleClick';

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
