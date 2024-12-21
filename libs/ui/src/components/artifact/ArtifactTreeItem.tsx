import { TreeRenderProps } from 'react-complex-tree';
import { InternalTreeItem, UNCATEGORIZED_ITEM_ID } from './ArtifactTree';
import styled from 'styled-components';
import { useRef } from 'react';
import { IonContent, useIonPopover } from '@ionic/react';
import { ArtifactTreeItemContextMenu } from './ArtifactTreeItemContextMenu';

const TreeListItem = styled.li<{
  $draggingOver: boolean;
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

const TreeItemButton = styled.button`
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

  &:hover {
    background-color: var(--ion-background-color);
  }
`;

export const ArtifactTreeItem: TreeRenderProps<
  InternalTreeItem,
  'expandedItems' | 'selectedItems'
>['renderItem'] = (props) => {
  const popoverDismissRef = useRef<() => void>();

  const popoverContents = (
    <IonContent onClick={popoverDismissRef.current}>
      <ArtifactTreeItemContextMenu artifactId={props.item.data.id} />
    </IonContent>
  );

  const [present, dismiss] = useIonPopover(popoverContents, {
    onDismiss: (data: any, role: string) => dismiss(data, role),
  });
  popoverDismissRef.current = dismiss;

  return (
    <>
      <TreeListItem
        {...props.context.itemContainerWithChildrenProps}
        $draggingOver={props.context.isDraggingOver || false}
        className={`rct-tree-item-li`}
      >
        <TreeItemContainer>
          {props.arrow}
          <TreeItemButton
            {...props.context.itemContainerWithoutChildrenProps}
            {...(props.context.interactiveElementProps as any)}
            className={`rct-tree-item-button`}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (props.item.data.id === UNCATEGORIZED_ITEM_ID) return;

              present({
                event: e.nativeEvent,
              });
            }}
          >
            {props.title}
          </TreeItemButton>
        </TreeItemContainer>
      </TreeListItem>
      {props.children}
    </>
  );
};
