import { TreeItem, TreeItemIndex, TreeRenderProps } from 'react-complex-tree';
import styled from 'styled-components';
import { useRef } from 'react';
import { IonContent, useIonPopover } from '@ionic/react';

import { InternalTreeItem, UNCATEGORIZED_ITEM_ID } from './ArtifactTree';
import { ArtifactTreeItemContextMenu } from './ArtifactTreeItemContextMenu';
import { getAllChildIdsForTreeItem } from '../../utils/artifactTree/getAllChildIdsForTreeItem';

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

const TreeItemContainer = styled.div`
  display: flex;
  align-items: center;
  padding-left: 8px;

  .rct-tree-item-arrow {
    width: 20px;
    height: 20px;
  }

  .rct-tree-item-arrow:has(svg) {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background-color: var(--ion-background-color);
    }
  }

  .rct-tree-item-arrow svg {
    width: 12px;
    height: 12px;
  }

  .rct-tree-item-arrow-path {
    fill: var(--ion-text-color);
  }
`;

const TreeItemButton = styled.button<{
  $isUncategorized: boolean;
}>`
  flex-grow: 1;
  display: flex;
  align-items: center;
  text-align: left;
  background-color: transparent;
  height: 32px;
  color: var(--ion-text-color);
  outline: none;
  border-radius: 5px;
  padding-left: 8px;
  padding-right: 8px;
  cursor: pointer;

  ${({ $isUncategorized }) =>
    !$isUncategorized &&
    `
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
}

export const ArtifactTreeItem: React.FC<ArtifactTreeItemProps> = (props) => {
  const popoverDismissRef = useRef<() => void>();

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

  const popoverContents = (
    <IonContent onClick={popoverDismissRef.current}>
      <ArtifactTreeItemContextMenu
        artifactId={props.treeRenderProps.item.data.id}
        expandAll={expandAll}
        collapseAll={collapseAll}
      />
    </IonContent>
  );

  const [present, dismiss] = useIonPopover(popoverContents, {
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });
  popoverDismissRef.current = dismiss;

  return (
    <>
      <TreeListItem
        {...props.treeRenderProps.context.itemContainerWithChildrenProps}
        $isUncategorized={
          props.treeRenderProps.item.data.id === UNCATEGORIZED_ITEM_ID
        }
        $draggingOver={props.treeRenderProps.context.isDraggingOver || false}
        className={`rct-tree-item-li`}
      >
        <TreeItemContainer>
          {props.treeRenderProps.arrow}
          <TreeItemButton
            {...props.treeRenderProps.context.itemContainerWithoutChildrenProps}
            {...(props.treeRenderProps.context.interactiveElementProps as any)}
            $isUncategorized={
              props.treeRenderProps.item.data.id === UNCATEGORIZED_ITEM_ID
            }
            className={`rct-tree-item-button`}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (props.treeRenderProps.item.data.id === UNCATEGORIZED_ITEM_ID)
                return;

              present({
                event: e.nativeEvent,
              });
            }}
          >
            {props.treeRenderProps.title}
          </TreeItemButton>
        </TreeItemContainer>
      </TreeListItem>
      {props.treeRenderProps.children}
    </>
  );
};
