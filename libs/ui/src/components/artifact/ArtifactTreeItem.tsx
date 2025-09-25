import { TreeItem, TreeItemIndex, TreeRenderProps } from 'react-complex-tree';
import styled from 'styled-components';

import { InternalTreeItem, UNCATEGORIZED_TREE_NODE_ID } from './ArtifactTree';
import { ArtifactTreeItemContextMenu } from './ArtifactTreeItemContextMenu';
import { getAllChildIdsForTreeItem } from '../../utils/artifactTree/getAllChildIdsForTreeItem';
import { IoChevronDown, IoChevronForward } from 'react-icons/io5';

const TreeListItem = styled.li<{
  $draggingOver: boolean;
  $isUncategorized: boolean;
}>`
  font-size: 0.8rem;
  list-style-type: none;
  padding: 0;
  margin: 0;

  ${({ $draggingOver }) =>
    $draggingOver &&
    `
    background-color: var(--ion-color-primary);
    color: var(--ion-color-primary);
  `}

  ${({ $isUncategorized }) =>
    $isUncategorized &&
    `
    &:hover {
      .rct-tree-item-arrow {
        background-color: var(--ion-background-color);
      }
    }
  `}
`;

const TreeItemContainer = styled.div<{
  $isUncategorized: boolean;
}>`
  display: flex;
  align-items: center;
  padding-left: 8px;

  .rct-tree-item-arrow {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  .rct-tree-item-arrow:has(svg) {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
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

    &:hover {
      background-color: var(--ion-background-color);
    }
  }

  .rct-tree-item-arrow svg {
    width: 18px;
    height: 18px;
  }
`;

const TreeItemButton = styled.button<{
  $isUncategorized: boolean;
}>`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;

  flex-grow: 1;
  background-color: transparent;
  height: 32px;
  color: var(--ion-text-color);
  outline: none;
  border-radius: 5px;
  padding-left: 8px;
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
    &:hover {
      background-color: var(--ion-background-color);
    }
  `}
`;

interface ArtifactTreeItemProps {
  treeRenderProps: Parameters<
    NonNullable<
      TreeRenderProps<
        InternalTreeItem,
        'expandedItems' | 'selectedItems'
      >['renderItem']
    >
  >[0];
  itemsRef: React.MutableRefObject<
    Record<TreeItemIndex, TreeItem<InternalTreeItem>>
  >;
  expandedItemsRef: React.MutableRefObject<string[]>;
  setExpandedItemsRef: React.MutableRefObject<
    (expandedItems: string[]) => void
  >;
  enableContextMenu: boolean;
}

export const ArtifactTreeItem: React.FC<ArtifactTreeItemProps> = (props) => {
  const expandAll = () => {
    const expandedItems = new Set(props.expandedItemsRef.current);
    expandedItems.add(props.treeRenderProps.item.data.id);

    const childIds = getAllChildIdsForTreeItem(
      props.itemsRef.current,
      props.treeRenderProps.item,
      0,
    );
    for (const childId of childIds) {
      expandedItems.add(childId);
    }
    props.setExpandedItemsRef.current(Array.from(expandedItems));
  };

  const collapseAll = () => {
    const expandedItems = new Set(props.expandedItemsRef.current);
    expandedItems.delete(props.treeRenderProps.item.data.id);

    const childIds = getAllChildIdsForTreeItem(
      props.itemsRef.current,
      props.treeRenderProps.item,
      0,
    );
    for (const childId of childIds) {
      expandedItems.delete(childId);
    }
    props.setExpandedItemsRef.current(Array.from(expandedItems));
  };

  const interactiveElementProps =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- typing is broken here
    props.treeRenderProps.context.interactiveElementProps as any;

  return (
    <>
      <TreeListItem
        {...props.treeRenderProps.context.itemContainerWithChildrenProps}
        $isUncategorized={
          props.treeRenderProps.item.data.id === UNCATEGORIZED_TREE_NODE_ID
        }
        $draggingOver={props.treeRenderProps.context.isDraggingOver || false}
        className={`rct-tree-item-li`}
      >
        <TreeItemContainer
          $isUncategorized={
            props.treeRenderProps.item.data.id === UNCATEGORIZED_TREE_NODE_ID
          }
        >
          {props.treeRenderProps.item.isFolder ? (
            <ArtifactTreeItemContextMenu
              enabled={
                props.enableContextMenu &&
                props.treeRenderProps.item.data.id !==
                  UNCATEGORIZED_TREE_NODE_ID
              }
              artifactId={props.treeRenderProps.item.data.id}
              paneId={undefined}
              expandAll={expandAll}
              collapseAll={collapseAll}
            >
              <div
                {...props.treeRenderProps.context.arrowProps}
                className={`rct-tree-item-arrow`}
              >
                {props.treeRenderProps.context.isExpanded ? (
                  <IoChevronDown />
                ) : (
                  <IoChevronForward />
                )}
              </div>
            </ArtifactTreeItemContextMenu>
          ) : (
            <div className={`rct-tree-item-arrow`} />
          )}
          <ArtifactTreeItemContextMenu
            enabled={
              props.enableContextMenu &&
              props.treeRenderProps.item.data.id !== UNCATEGORIZED_TREE_NODE_ID
            }
            artifactId={props.treeRenderProps.item.data.id}
            paneId={undefined}
            expandAll={expandAll}
            collapseAll={collapseAll}
          >
            <TreeItemButton
              {...props.treeRenderProps.context
                .itemContainerWithoutChildrenProps}
              {...interactiveElementProps}
              $isUncategorized={
                props.treeRenderProps.item.data.id ===
                UNCATEGORIZED_TREE_NODE_ID
              }
              className={`rct-tree-item-button`}
            >
              {props.treeRenderProps.title}
            </TreeItemButton>
          </ArtifactTreeItemContextMenu>
        </TreeItemContainer>
      </TreeListItem>
      {props.treeRenderProps.children}
    </>
  );
};
