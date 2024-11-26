import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { collaborationManager } from '../editor/collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { trpc } from '../../utils/trpc';
import { ArtifactDTO } from '@feynote/global-types';
import {
  ControlledTreeEnvironment,
  DraggingPosition,
  InteractionMode,
  Tree,
  TreeItem,
  TreeItemIndex,
} from 'react-complex-tree';
import { EventName } from '../../context/events/EventName';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import { ImmediateDebouncer } from '@feynote/shared-utils';
import { eventManager } from '../../context/events/EventManager';
import styled from 'styled-components';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';

/**
 * Calculates a lexographic sort order between two uppercase strings.
 * The absolute values "A" and "Z" are used as the lower and upper bounds, but will not be returned as lexographic sort order.
 * You can use "A" and "Z" as the lower and upper bounds, respectively, when passing in arguments to place an item at the upper or lower bound.
 */
const _calculateOrderBetween = (a: string, b: string): string => {
  const aChar = a[0] || 'A';
  const aCharCode = a ? a.charCodeAt(0) : 'A'.charCodeAt(0);
  const bCharCode = b ? b.charCodeAt(0) : 'Z'.charCodeAt(0);

  if (bCharCode - aCharCode >= 2) {
    return String.fromCharCode(bCharCode - 1);
  }

  if (bCharCode - aCharCode === 1) {
    return aChar + _calculateOrderBetween(a.substring(1), '');
  }

  return aChar + _calculateOrderBetween(a.substring(1), b.substring(1));
};

const calculateOrderBetween = (a = 'A', b = 'Z'): string => {
  const validRegex = /^[A-Z]*$/;
  if (!validRegex.test(a) || !validRegex.test(b)) {
    console.error('a and b must be uppercase strings');
    // TODO: log to sentry
    // We do not want to break the user's experience
    return 'Y';
  }

  if (a.localeCompare(b) > 0) {
    throw new Error('a must be greater than b');
  }

  return _calculateOrderBetween(a, b);
};

const StyleContainer = styled.div`
  .rct-tree-root {
    padding-top: 4px;
    padding-bottom: 4px;
    padding-right: 4px;
  }

  .rct-tree-item-li {
    font-size: 0.8rem;
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  .rct-tree-item-title-container {
    display: flex;
    align-items: center;
    padding-left: 16px;
  }

  .rct-tree-item-button {
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
  }

  .rct-tree-item-button:hover {
    background-color: var(--ion-background-color);
  }

  .rct-tree-item-arrow:has(svg) {
    width: 20px;
    height: 20px;
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

  .rct-tree-items-container {
    margin: 0;
    padding: 0;
  }

  .rct-tree-items-container .rct-tree-items-container {
    margin-left: 20px;
  }

  .rct-tree-item-title-container-dragging-over {
    background-color: var(--ion-color-primary);
    color: var(--ion-color-primary);
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

interface InternalTreeItem {
  id: string;
  title: string;
  order: string;
  draggable?: boolean;
}

const TREE_ID = 'appArtifactTree';
const ROOT_ITEM_ID = 'root';
const RELOAD_DEBOUNCE_INTERVAL_MS = 5000;

export const ArtifactTree = () => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const { session } = useContext(SessionContext);
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { navigate, getPaneById } = useContext(GlobalPaneContext);
  const currentPane = getPaneById(undefined);

  const connection = collaborationManager.get(
    `userTree:${session.userId}`,
    session,
  );
  const yDoc = connection.yjsDoc;

  const yKeyValue = useMemo(() => {
    const yArray = yDoc.getArray('treeNodes');
    const yKeyValue = new YKeyValue<{
      parentNodeId: string | null;
      order: string;
    }>(yArray as any);

    return yKeyValue;
  }, [yDoc]);

  const load = () => {
    trpc.artifact.getArtifacts
      .query()
      .then((artifacts) => {
        setArtifacts(artifacts);
        triggerRerender();
      })
      .catch((e) => {
        // TODO: Log to sentry
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };
    yKeyValue.on('change', listener);

    return () => {
      yKeyValue.off('change', listener);
    };
  }, [yKeyValue]);

  useEffect(() => {
    loadDebouncerRef.current.call();
  }, [currentPane.currentView.navigationEventId]);

  const loadDebouncerRef = useRef(
    new ImmediateDebouncer(
      () => {
        load();
      },
      RELOAD_DEBOUNCE_INTERVAL_MS,
      {
        enableFollowupCall: true,
      },
    ),
  );

  useEffect(() => {
    const handler = () => {
      loadDebouncerRef.current.call();
    };

    eventManager.addEventListener(
      [EventName.ArtifactUpdated, EventName.ArtifactDeleted],
      handler,
    );

    return () => {
      eventManager.removeEventListener(
        [EventName.ArtifactUpdated, EventName.ArtifactDeleted],
        handler,
      );
    };
  }, []);

  const items = useMemo((): Record<
    TreeItemIndex,
    TreeItem<InternalTreeItem>
  > => {
    const artifactsById = new Map(
      artifacts.map((artifact) => [artifact.id, artifact]),
    );

    const kvEntries = new Map(yKeyValue.yarray.map((el) => [el.key, el.val]));

    const items: Record<TreeItemIndex, TreeItem<InternalTreeItem>> = {};

    // Build tree nodes
    for (const [key, value] of kvEntries) {
      const artifact = artifactsById.get(key);
      if (!artifact) {
        continue;
      }

      items[key] = {
        index: key,
        data: {
          id: key,
          title: artifact.title,
          order: value.order,
        },
        children: [],
        isFolder: false,
      };
    }

    for (const artifact of artifacts) {
      if (!items[artifact.id]) {
        items[artifact.id] = {
          index: artifact.id,
          data: {
            id: artifact.id,
            title: artifact.title,
            order: 'Z',
          },
          children: [],
          isFolder: false,
        };
      }
    }

    // Populate children
    for (const [key, value] of kvEntries) {
      if (value.parentNodeId && items[value.parentNodeId]) {
        items[value.parentNodeId].children?.push(key);
        items[value.parentNodeId].isFolder = true;
      }
    }

    // Sort children
    for (const key in items) {
      items[key].children = items[key].children?.sort((a, b) => {
        const aItem = items[a];
        const bItem = items[b];

        const comparison = aItem.data.order.localeCompare(bItem.data.order);
        if (comparison === 0) {
          return aItem.data.title.localeCompare(bItem.data.title);
        }
        return comparison;
      });
    }

    // Create root node
    items[ROOT_ITEM_ID] = {
      index: ROOT_ITEM_ID,
      data: {
        id: ROOT_ITEM_ID,
        title: 'Root',
        order: 'A',
      },
      // Children should be anything that has no parent item found in our collection
      children: Object.entries(items)
        .filter(
          ([key]) =>
            kvEntries.get(key)?.parentNodeId === null || !kvEntries.get(key),
        )
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
  }, [yKeyValue, _rerenderReducerValue]);

  const onDrop = (
    droppedItems: TreeItem<InternalTreeItem>[],
    target: DraggingPosition,
  ) => {
    if (target.targetType === 'root') {
      const parentItem = items[target.targetItem];
      const lastParentChildOrder =
        parentItem.children?.[parentItem.children!.length - 1]?.toString() ||
        'A';

      for (const item of droppedItems) {
        const order = calculateOrderBetween(lastParentChildOrder, 'Z');

        yKeyValue.set(item.data.id, {
          parentNodeId: null,
          order,
        });
      }
    }
    if (target.targetType === 'item') {
      const parentItem = items[target.targetItem];
      const lastParentChildOrder =
        parentItem.children?.[parentItem.children!.length - 1]?.toString() ||
        'A';

      for (const item of droppedItems) {
        const order = calculateOrderBetween(lastParentChildOrder, 'Z');

        yKeyValue.set(item.data.id, {
          parentNodeId:
            target.targetItem.toString() === 'root'
              ? null
              : target.targetItem.toString(),
          order,
        });
      }
    }
    if (target.targetType === 'between-items') {
      const parentItem = items[target.parentItem];
      let previousItemOrder =
        items[parentItem.children?.[target.childIndex - 1] || -1]?.data.order ||
        'A';
      const nextItemOrder =
        items[parentItem.children?.[target.childIndex] || -1]?.data.order ||
        'Z';

      for (const item of droppedItems) {
        const order = calculateOrderBetween(previousItemOrder, nextItemOrder);

        yKeyValue.set(item.data.id, {
          parentNodeId:
            target.parentItem.toString() === 'root'
              ? null
              : target.parentItem.toString(),
          order,
        });

        previousItemOrder = order;
      }
    }
  };

  return (
    <StyleContainer>
      <ControlledTreeEnvironment
        items={items}
        getItemTitle={(item) => item.data.title}
        viewState={{
          [TREE_ID]: {
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
          createInteractiveElementProps: (item, treeId, actions) => ({
            onClick: (e) => {
              if (e.ctrlKey || e.metaKey) {
                actions.selectItem();
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
          }),
        }}
        canDragAndDrop
        canDropOnFolder
        canReorderItems
        canDropOnNonFolder
        onDrop={onDrop}
      >
        <Tree treeId={TREE_ID} rootItem={ROOT_ITEM_ID} />
      </ControlledTreeEnvironment>
    </StyleContainer>
  );
};
