import {
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react';
import {
  ControlledTreeEnvironment,
  DraggingPosition,
  InteractionMode,
  Tree,
  TreeItem,
  TreeItemIndex,
} from 'react-complex-tree';
import styled from 'styled-components';
import { t } from 'i18next';
import * as Sentry from '@sentry/react';

import {
  collaborationManager,
  CollaborationManagerConnection,
} from '../editor/collaborationManager';
import { SessionContext } from '../../context/session/SessionContext';
import { trpc } from '../../utils/trpc';
import { ArtifactCollectionDTO, ArtifactDTO } from '@feynote/global-types';
import { EventName } from '../../context/events/EventName';
import {
  GlobalPaneContext,
  PaneTransition,
} from '../../context/globalPane/GlobalPaneContext';
import {
  ARTIFACT_META_KEY,
  getMetaFromYArtifactCollection,
  getTreeFromYDoc,
  ImmediateDebouncer,
  PreferenceNames,
  SessionDTO,
  TreeYKVNode,
} from '@feynote/shared-utils';
import { eventManager } from '../../context/events/EventManager';
import { PaneableComponent } from '../../context/globalPane/PaneableComponent';
import { PreferencesContext } from '../../context/preferences/PreferencesContext';
import { ArtifactTreeItem } from './ArtifactTreeItem';
import {
  CustomDragStateData,
  getCustomDragData,
  registerStartTreeDrag,
  setCustomDragData,
} from '../../utils/artifactTree/customDrag';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { Map as YMap } from 'yjs';
import { ArtifactAccessLevel } from '@prisma/client';
import { TypedMap } from 'yjs-types';

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
    Sentry.captureException(new Error('a and b must be uppercase strings'), {
      extra: {
        a,
        b,
      },
    });
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

interface BaseInternalTreeItem {
  aliasId: string;
  title: string;
  order: string;
  draggable?: boolean;
}

interface RootInternalTreeItem extends BaseInternalTreeItem {
  type: 'personalTreeRoot' | 'collectionTreeRoot' | 'uncategorized';
}

interface CollectionInternalTreeItem extends BaseInternalTreeItem {
  type: 'collection';
  collectionId: string;
}

interface CollectionArtifactInternalTreeItem extends BaseInternalTreeItem {
  type: 'collectionArtifact';
  artifactId: string;
  collectionId: string;
}

interface UncategorizedArtifactInternalTreeItem extends BaseInternalTreeItem {
  type: 'uncategorizedArtifact';
  artifactId: string;
  collectionId?: undefined;
}

interface PersonalArtifactInternalTreeItem extends BaseInternalTreeItem {
  type: 'personalArtifact';
  artifactId: string;
  collectionId?: undefined;
}

export type InternalTreeItem =
  | RootInternalTreeItem
  | CollectionInternalTreeItem
  | CollectionArtifactInternalTreeItem
  | PersonalArtifactInternalTreeItem
  | UncategorizedArtifactInternalTreeItem;

const PERSONAL_TREE_ID = 'personalArtifactTree';
const PERSONAL_ROOT_ITEM_ID = 'personalArtifactTreeRoot';
const COLLECTION_ROOT_ITEM_ID = 'collectionArtifactTreeRoot';
const COLLECTION_TREE_ID = 'collectionArtifactTree';
export const UNCATEGORIZED_ITEM_ID = 'uncategorized';
const RELOAD_DEBOUNCE_INTERVAL_MS = 3000;

const moveArtifact = async (args: {
  artifactId: string;
  newCollectionId: string | null;
  session: SessionDTO;
  nodeVal: Omit<TreeYKVNode['val'], 'userAccess'>;
}) => {
  const artifactConnection = collaborationManager.get(
    `artifact:${args.artifactId}`,
    args.session,
  );
  await artifactConnection.syncedPromise;
  const yArtifactMetaMap = artifactConnection.yjsDoc.getMap(ARTIFACT_META_KEY);
  const oldCollectionId = yArtifactMetaMap.get('collectionId') as
    | string
    | undefined;

  // We only need to remove the artifact from the old collection if it's changing collections
  if (oldCollectionId !== args.newCollectionId) {
    yArtifactMetaMap.set('collectionId', args.newCollectionId);

    if (oldCollectionId) {
      const oldCollectionConnection = collaborationManager.get(
        `artifactCollection:${oldCollectionId}`,
        args.session,
      );
      await oldCollectionConnection.syncedPromise;
      const tree = getTreeFromYDoc(oldCollectionConnection.yjsDoc);
      tree.yKeyValue.delete(args.artifactId);
    } else {
      const personalConnection = collaborationManager.get(
        `userTree:${args.session.userId}`,
        args.session,
      );
      await personalConnection.syncedPromise;
      const tree = getTreeFromYDoc(personalConnection.yjsDoc);
      tree.yKeyValue.delete(args.artifactId);
    }
  }

  if (args.newCollectionId) {
    const collectionConnection = collaborationManager.get(
      `artifactCollection:${args.newCollectionId}`,
      args.session,
    );
    await collectionConnection.syncedPromise;
    const tree = getTreeFromYDoc(collectionConnection.yjsDoc);

    // When we're moving an item in the same collection, we don't want to erase the user's custom access permissions
    const userAccess =
      args.newCollectionId === oldCollectionId
        ? tree.yKeyValue.get(args.artifactId)?.userAccess.clone()
        : undefined;

    tree.yKeyValue.set(args.artifactId, {
      ...args.nodeVal,
      userAccess:
        userAccess ||
        (new YMap() as TypedMap<{
          [userId: string]: ArtifactAccessLevel;
        }>),
    });
  } else {
    const personalConnection = collaborationManager.get(
      `userTree:${args.session.userId}`,
      args.session,
    );
    await personalConnection.syncedPromise;
    const tree = getTreeFromYDoc(personalConnection.yjsDoc);
    tree.yKeyValue.set(args.artifactId, {
      ...args.nodeVal,
      // We drop user access when moving to a personal tree
      userAccess: new YMap() as TypedMap<{
        [userId: string]: ArtifactAccessLevel;
      }>,
    });
  }
};

const sortTreeItems = (
  a: TreeItem<InternalTreeItem>,
  b: TreeItem<InternalTreeItem>,
) => {
  const comparison = a.data.order.localeCompare(b.data.order);
  if (comparison === 0) {
    return a.data.title.localeCompare(b.data.title);
  }
  return comparison;
};

const mutateSortTreeChildren = (
  items: Record<TreeItemIndex, TreeItem<InternalTreeItem>>,
) => {
  for (const key in items) {
    items[key].children = items[key].children?.sort((a, b) =>
      sortTreeItems(items[a], items[b]),
    );
  }
};

const buildATreeHelper = (opts: {
  artifacts: ArtifactDTO[];
  yKeyValue: YKeyValue<TreeYKVNode['val']>;
  itemIdPrefix: string;
  collectionId: string | null;
  userId: string;
}) => {
  const artifactsById = new Map(
    opts.artifacts.map((artifact) => [artifact.id, artifact]),
  );

  const aliasedKvEntriesMap = new Map<
    string,
    TreeYKVNode['val'] & {
      artifactId: string;
    }
  >();
  for (const entry of opts.yKeyValue.yarray) {
    aliasedKvEntriesMap.set(`${opts.itemIdPrefix}:${entry.key}`, {
      ...entry.val,
      artifactId: entry.key,
    });
  }

  const items: Record<TreeItemIndex, TreeItem<InternalTreeItem>> = {};

  // Build tree nodes
  for (const [key, value] of aliasedKvEntriesMap) {
    const artifact = artifactsById.get(value.artifactId);

    if (opts.collectionId) {
      // For shared collections, we may not have access to the artifact in question
      const title = artifact?.title || t('artifactTree.invisibleArtifact');

      items[key] = {
        index: key,
        data: {
          type: 'collectionArtifact',
          aliasId: key,
          artifactId: value.artifactId,
          title,
          order: value.order,
          collectionId: opts.collectionId,
        },
        children: [],
        isFolder: false,
      };
    } else {
      if (!artifact) {
        // Artifact appears to be deleted, do not render but also do not remove from kvlist in case it comes back
        continue;
      }

      items[key] = {
        index: key,
        data: {
          type: 'personalArtifact',
          aliasId: key,
          artifactId: value.artifactId,
          title: artifact?.title || t('artifactTree.invisibleArtifact'),
          order: value.order,
        },
        children: [],
        isFolder: false,
      };
    }
  }

  const uncategorizedArtifacts = new Set<string>();
  for (const artifact of opts.artifacts) {
    if (
      // An artifact existing in our artifacts list but not being included in our kv list means that it has never been
      // added to the tree. We want to make sure users don't lose track of artifacts so keep them in an uncategorized list
      !opts.yKeyValue.has(artifact.id) &&
      // We only want to show uncategorized artifacts that actually belong to the current user
      artifact.userId === opts.userId &&
      // We don't do uncategorized for a collection - if it's not in the collection, it's not in the collection
      !opts.collectionId
    ) {
      const treeItemId = `uncategorizedArtifact:${artifact.id}`;
      items[treeItemId] = {
        index: treeItemId,
        data: {
          type: 'personalArtifact',
          aliasId: treeItemId,
          artifactId: artifact.id,
          title: artifact.title,
          order: 'Y',
        },
        children: [],
        isFolder: false,
      };

      uncategorizedArtifacts.add(artifact.id);
    }
  }

  // Populate tree children
  for (const [key, value] of aliasedKvEntriesMap) {
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

  mutateSortTreeChildren(items);

  return {
    items,
    uncategorizedArtifacts,
  };
};

interface Props {
  renderPersonalSection: (children: React.ReactNode) => React.ReactNode;
  renderCollectionSection: (children: React.ReactNode) => React.ReactNode;
}

export const ArtifactTree: React.FC<Props> = (props) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const { session } = useContext(SessionContext);
  const { getPreference } = useContext(PreferencesContext);
  const leftPaneArtifactTreeShowUncategorized = getPreference(
    PreferenceNames.LeftPaneArtifactTreeShowUncategorized,
  );
  const [artifacts, setArtifacts] = useState<ArtifactDTO[]>([]);
  const [artifactCollections, setArtifactCollections] = useState<
    ArtifactCollectionDTO[]
  >([]);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const expandedItemsRef = useRef(expandedItems);
  expandedItemsRef.current = expandedItems;
  const setExpandedItemsRef = useRef(setExpandedItems);
  setExpandedItemsRef.current = setExpandedItems;
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const { navigate, getPaneById } = useContext(GlobalPaneContext);
  const currentPane = getPaneById(undefined);

  const personalConnection = collaborationManager.get(
    `userTree:${session.userId}`,
    session,
  );
  const { yKeyValue: personalYKeyValue } = getTreeFromYDoc(
    personalConnection.yjsDoc,
  );

  const artifactCollectionConnections = artifactCollections.reduce(
    (acc, collection) => {
      acc[collection.id] = collaborationManager.get(
        `artifactCollection:${collection.id}`,
        session,
      );
      return acc;
    },
    {} as Record<string, CollaborationManagerConnection>,
  );

  const artifactCollectionsY = useMemo(() => {
    const map = {} as Record<string, ReturnType<typeof getTreeFromYDoc>>;
    for (const [collectionId, connection] of Object.entries(
      artifactCollectionConnections,
    )) {
      const tree = getTreeFromYDoc(connection.yjsDoc);
      map[collectionId] = tree;
    }
    return map;
  }, [
    Object.keys(artifactCollectionConnections)
      .map((key) => key)
      .join(','),
  ]);

  const load = () => {
    Promise.all([
      trpc.artifact.getArtifacts.query(),
      trpc.artifactCollection.getArtifactCollections.query(),
    ])
      .then(([artifacts, artifactCollections]) => {
        setArtifacts(artifacts);
        setArtifactCollections(artifactCollections);
        triggerRerender();
      })
      .catch(() => {
        // Do nothing
      });
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const listener = () => {
      triggerRerender();
    };
    personalYKeyValue.on('change', listener);
    Object.values(artifactCollectionsY).forEach((el) => {
      el.yKeyValue.on('change', listener);
    });

    return () => {
      personalYKeyValue.off('change', listener);
      Object.values(artifactCollectionsY).forEach((el) => {
        el.yKeyValue.off('change', listener);
      });
    };
  }, [
    personalYKeyValue,
    Object.keys(artifactCollectionConnections)
      .map((key) => key)
      .join(','),
  ]);

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
    //const artifactsById = new Map(
    //  artifacts.map((artifact) => [artifact.id, artifact]),
    //);
    //
    //const aliasedKvEntriesMap = new Map<string, TreeYKVNode['val'] & {
    //  artifactId: string;
    //  collectionId: string | null;
    //}>();
    //for (const entry of personalYKeyValue.yarray) {
    //  aliasedKvEntriesMap.set(`personalTree:${entry.key}`, {
    //    ...entry.val,
    //    artifactId: entry.key,
    //    collectionId: null,
    //  });
    //}
    //for (let i = 0; i < artifactCollections.length; i++) {
    //  for (const entry of artifactCollectionsY[i].yKeyValue.yarray) {
    //    aliasedKvEntriesMap.set(`sharedCollectionTree:${artifactCollections[i].id}:${entry.key}`, {
    //      ...entry.val,
    //      artifactId: entry.key,
    //      collectionId: artifactCollections[i].id,
    //    });
    //  }
    //}
    //
    //const items: Record<TreeItemIndex, TreeItem<InternalTreeItem>> = {};
    //
    //// Build tree nodes
    //for (const [key, value] of aliasedKvEntriesMap) {
    //  const artifact = artifactsById.get(key);
    //  if (!artifact && !value.collectionId) {
    //    // Artifact appears to be deleted, do not render but also do not remove from kvlist in case it comes back
    //    continue;
    //  }
    //
    //  items[key] = {
    //    index: key,
    //    data: {
    //      type: 'personalArtifact',
    //      aliasId: key,
    //      artifactId: value.artifactId,
    //      title: artifact?.title || t('artifactTree.invisibleArtifact'),
    //      order: value.order,
    //    },
    //    children: [],
    //    isFolder: false,
    //  };
    //}
    //
    //// Artifact not explicitly added to tree, add it to uncategorized
    //const uncategorizedArtifacts = new Set<string>();
    //for (const artifact of artifacts) {
    //  const isInPersonalTree = aliasedKvEntriesMap.has(`personalTree:${artifact.id}`);
    //  if (!isInPersonalTree && artifact.userId === session.userId) {
    //    const treeItemId = `uncategorizedArtifact:${artifact.id}`;
    //    items[treeItemId] = {
    //      index: treeItemId,
    //      data: {
    //        type: 'personalArtifact',
    //        aliasId: treeItemId,
    //        artifactId: artifact.id,
    //        title: artifact.title,
    //        order: 'Y',
    //      },
    //      children: [],
    //      isFolder: false,
    //    };
    //
    //    uncategorizedArtifacts.add(artifact.id);
    //  }
    //}
    //
    //for (let i = 0; i < artifactCollections.length; i++) {
    //  const connection = artifactCollectionConnections[i];
    //  const meta = getMetaFromYArtifactCollection(connection.yjsDoc);
    //  const { yKeyValue } = artifactCollectionsY[i];
    //
    //  const treeItemId = `artifactCollection:${artifactCollections[i].id}`;
    //  items[treeItemId] = {
    //    index: treeItemId,
    //    data: {
    //      type: 'collectionRoot',
    //      aliasId: treeItemId,
    //      title: meta.title,
    //      order: 'Y',
    //      collectionId: artifactCollections[i].id,
    //    },
    //    children: yKeyValue.yarray.map((el) => el.key),
    //    isFolder: true,
    //    canMove: false,
    //  };
    //}
    //
    //// Populate tree children
    //for (const [key, value] of aliasedKvEntriesMap) {
    //  // We may have hanging items in our kvlist that aren't accessible to us anymore
    //  if (!items[key]) continue;
    //
    //  // Find item which this item is a child of, and add to the parent item's children list
    //  // enabling folder mode for the parent item
    //  if (value.parentNodeId && items[value.parentNodeId]) {
    //    items[value.parentNodeId].children?.push(key);
    //    items[value.parentNodeId].isFolder = true;
    //  }
    //
    //  // Parents for nodes may be deleted, unshared, or otherwise invalid.
    //  // We don't want them to be permanently unavailable in the tree
    //  if (value.parentNodeId && !items[value.parentNodeId]) {
    //    uncategorizedArtifacts.add(key);
    //  }
    //}
    //
    //if (leftPaneArtifactTreeShowUncategorized) {
    //  // All uncategorized items go under their own header
    //  items[UNCATEGORIZED_ITEM_ID] = {
    //    index: UNCATEGORIZED_ITEM_ID,
    //    data: {
    //      type: 'uncategorizedRoot',
    //      aliasId: UNCATEGORIZED_ITEM_ID,
    //      title: t('artifactTree.uncategorized', {
    //        count: uncategorizedArtifacts.size,
    //      }),
    //      order: 'XZ',
    //    },
    //    children: Array.from(uncategorizedArtifacts),
    //    isFolder: true,
    //    canMove: false,
    //  };
    //}
    //
    //// Sort children
    //for (const key in items) {
    //  items[key].children = items[key].children?.sort((a, b) => {
    //    const aItem = items[a];
    //    const bItem = items[b];
    //
    //    const comparison = aItem.data.order.localeCompare(bItem.data.order);
    //    if (comparison === 0) {
    //      return aItem.data.title.localeCompare(bItem.data.title);
    //    }
    //    return comparison;
    //  });
    //}
    const personalTree = buildATreeHelper({
      artifacts,
      yKeyValue: personalYKeyValue,
      itemIdPrefix: 'personalTree',
      collectionId: null,
      userId: session.userId,
    });

    console.log('baba', artifactCollections, artifactCollectionsY);
    const collections = artifactCollections
      .filter((artifactCollection) => {
        return artifactCollectionsY[artifactCollection.id];
      })
      .map((artifactCollection) => {
        return {
          id: artifactCollection.id,
          connection: artifactCollectionConnections[artifactCollection.id],
          ...buildATreeHelper({
            artifacts,
            yKeyValue: artifactCollectionsY[artifactCollection.id].yKeyValue,
            itemIdPrefix: 'sharedCollectionTree',
            collectionId: artifactCollection.id,
            userId: session.userId,
          }),
        };
      });

    const allItems = {} as Record<TreeItemIndex, TreeItem<InternalTreeItem>>;

    for (const [key, value] of Object.entries(personalTree.items)) {
      allItems[key] = value;
    }

    if (leftPaneArtifactTreeShowUncategorized) {
      // All uncategorized items go under their own header
      allItems[UNCATEGORIZED_ITEM_ID] = {
        index: UNCATEGORIZED_ITEM_ID,
        data: {
          type: 'uncategorized',
          aliasId: UNCATEGORIZED_ITEM_ID,
          title: t('artifactTree.uncategorized', {
            count: personalTree.uncategorizedArtifacts.size,
          }),
          order: 'XZ',
        },
        children: Array.from(personalTree.uncategorizedArtifacts),
        isFolder: true,
        canMove: false,
      };
    }

    for (const [key, value] of Object.entries(personalTree.items)) {
      allItems[key] = value;
    }

    // Personal root node
    allItems[PERSONAL_ROOT_ITEM_ID] = {
      index: PERSONAL_ROOT_ITEM_ID,
      data: {
        type: 'personalTreeRoot',
        aliasId: PERSONAL_ROOT_ITEM_ID,
        title: 'Root',
        order: 'A',
      },
      // Children should be anything that has no parent item found in our collection
      children: Object.entries(personalTree.items)
        .filter(([key, value]) => {
          // We always want the list of uncategorized artifacts at the root
          if (key === UNCATEGORIZED_ITEM_ID) return true;

          const node = value.data;
          if (node.type !== 'personalArtifact') return false;

          const kvEntry = personalYKeyValue.get(node.artifactId);

          // 'null' is the root node, so this element belongs at root
          if (kvEntry?.parentNodeId === null) return true;

          return false;
        })
        .sort(([_, aVal], [__, bVal]) => sortTreeItems(aVal, bVal))
        .map(([key]) => key),
    };

    const collectionRoots = collections.map((collection, i) => {
      const collectionId = collection.id;
      console.log('haha crie', artifactCollectionConnections, i);
      const meta = getMetaFromYArtifactCollection(
        artifactCollectionConnections[collection.id].yjsDoc,
      );

      return {
        index: `collectionRoot:${collectionId}`,
        data: {
          type: 'collection',
          aliasId: `collectionRoot:${collectionId}`,
          title: meta.title,
          order: 'Y',
          collectionId,
        },
        children: Object.entries(collection.items)
          .filter(([key]) => {
            const kvEntry = artifactCollectionsY[i].yKeyValue.get(key);

            // 'null' is the root node, so this element belongs at root
            if (kvEntry?.parentNodeId === null) return true;

            return false;
          })
          .sort(([_, aVal], [__, bVal]) => sortTreeItems(aVal, bVal))
          .map(([key]) => key),
      } satisfies TreeItem<CollectionInternalTreeItem>;
    });

    for (const collectionRoot of collectionRoots) {
      allItems[collectionRoot.index] = collectionRoot;
    }

    // Collection root node
    allItems[COLLECTION_ROOT_ITEM_ID] = {
      index: COLLECTION_ROOT_ITEM_ID,
      data: {
        type: 'collectionTreeRoot',
        aliasId: COLLECTION_ROOT_ITEM_ID,
        title: 'Collections',
        order: 'A',
      },
      children: collectionRoots.map((collection) => collection.index),
    };

    return allItems;
  }, [
    personalYKeyValue,
    _rerenderReducerValue,
    leftPaneArtifactTreeShowUncategorized,
  ]);
  const itemsRef = useRef<Record<TreeItemIndex, TreeItem<InternalTreeItem>>>(
    {},
  );
  itemsRef.current = items;

  /**
   * Uncategorize all descendants of the itemsToDelete
   */
  const recursiveRemoveFromTree = (
    itemsToDelete: TreeItem<InternalTreeItem>[],
  ) => {
    for (const itemToDelete of itemsToDelete) {
      if (itemToDelete.data.type === 'collectionArtifact') {
        const collectionId = itemToDelete.data.collectionId;
        const collectionIdx = artifactCollections.findIndex(
          (collection) => collection.id === collectionId,
        );
        artifactCollectionsY[collectionIdx].yKeyValue.delete(
          itemToDelete.data.artifactId,
        );
      } else if (itemToDelete.data.type === 'personalArtifact') {
        personalYKeyValue.delete(itemToDelete.data.artifactId);
      }

      const children = itemToDelete.children?.map(
        (child) => items[child.toString()],
      );
      if (children?.length) {
        recursiveRemoveFromTree(children);
      }
    }
  };

  const onDrop = (
    droppedItems: TreeItem<InternalTreeItem>[],
    target: DraggingPosition,
  ) => {
    //if (target.targetType === 'root') {
    //  // TODO: Dropping on a tree root should prompt the user to share _if_ the item is owned by the user and the tree is the collection tree
    //
    //  if (target.targetItem === PERSONAL_ROOT_ITEM_ID) {
    //    const parentItem = items[target.targetItem];
    //    if (!parentItem.children)
    //      throw new Error("ParentItem of an item doesn't have children somehow");
    //    const lastParentChildOrder =
    //      parentItem.children.at(parentItem.children.length - 1)?.toString() ||
    //      'A';
    //
    //    for (const item of droppedItems) {
    //      const order = calculateOrderBetween(lastParentChildOrder, 'Z');
    //
    //      if ('artifactId' in item.data) {
    //        personalYKeyValue.set(item.data.artifactId, {
    //          parentNodeId: null,
    //          order,
    //        });
    //      }
    //    }
    //  } else {
    //    // TODO: handle dropping on a collection root
    //  }
    //}
    if (target.targetType === 'root' || target.targetType === 'item') {
      if (isItemUncategorized(target.targetItem.toString())) {
        // This is unexpected since we should have already prevented this in canDropAt
        const error = new Error('Cannot drop on uncategorized');
        console.error(error);
        Sentry.captureException(error);
        return;
      }

      if (target.targetItem.toString() === UNCATEGORIZED_ITEM_ID) {
        recursiveRemoveFromTree(
          droppedItems.filter((item) => item.data.type === 'personalArtifact'),
        );

        return;
      }

      const targetItem = items[target.targetItem];
      if (
        targetItem.data.type !== 'collection' &&
        targetItem.data.type !== 'collectionArtifact' &&
        targetItem.data.type !== 'personalArtifact' &&
        targetItem.data.type !== 'personalTreeRoot'
      ) {
        return;
      }

      if (
        droppedItems.filter((item) => item.data.type === 'collectionArtifact')
          .length !== droppedItems.length &&
        droppedItems.filter((item) => item.data.type === 'personalArtifact')
          .length !== droppedItems.length
      ) {
        // We don't allow mixing collection artifacts with personal artifacts
        return;
      }

      const parentItem = items[target.targetItem];
      if (!parentItem.children)
        throw new Error("ParentItem of an item doesn't have children somehow");
      let lastParentChildOrder =
        parentItem.children[parentItem.children.length - 1]?.toString() || 'A';

      console.log('dropped', droppedItems);
      for (const item of droppedItems) {
        if (
          item.data.type === 'collectionArtifact' ||
          item.data.type === 'personalArtifact'
        ) {
          // We move this pointer to keep order consistent
          lastParentChildOrder = calculateOrderBetween(
            lastParentChildOrder,
            'Z',
          );

          moveArtifact({
            artifactId: item.data.artifactId,
            newCollectionId:
              ('collectionId' in targetItem.data
                ? targetItem.data.collectionId
                : null) || null,
            session,
            nodeVal: {
              parentNodeId:
                targetItem.data.type === 'collection' ||
                targetItem.data.type === 'personalTreeRoot'
                  ? null
                  : target.targetItem.toString(),
              order: lastParentChildOrder,
            },
          });
        }
      }

      //if (droppedItems.filter((item) => item.data.type === 'collectionArtifact').length === droppedItems.length) {
      //  if (targetItem.data.type === 'personalArtifact') {
      //    // TODO: Alert user that you can't move a collection to a personal artifact
      //  }
      //
      //  if (targetItem.data.type === 'collection' || targetItem.data.type === 'collectionArtifact') {
      //    // TODO: Check permissions when dropping onto a collection. Also, check if it's the same collection or a different collection
      //  }
      //}
      //
      //if (droppedItems.filter((item) => item.data.type === 'personalArtifact').length === droppedItems.length) {
      //  // Dropped items are all personal artifacts
      //  //
      //  const targetItemType = targetItem.data.type;
      //
      //  if (targetItemType === 'collection' || targetItemType === 'collectionArtifact') {
      //    // Dropping personal artifacts on a collection should add them to the collection
      //    // but we need to prompt user if they want to share
      //
      //    const parentItem = items[target.targetItem];
      //    if (!parentItem.children)
      //      throw new Error("ParentItem of an item doesn't have children somehow");
      //
      //    const collectionId = targetItem.data.collectionId;
      //    const lastParentChildOrder =
      //      parentItem.children[parentItem.children.length - 1]?.toString() || 'A';
      //
      //    for (const item of droppedItems) {
      //      const order = calculateOrderBetween(lastParentChildOrder, 'Z');
      //
      //      if ('artifactId' in item.data) {
      //        const collectionId = targetItem.data.collectionId;
      //        const collectionIdx = artifactCollections.findIndex(
      //          (collection) => collection.id === collectionId,
      //        );
      //        artifactCollectionsY[collectionIdx].yKeyValue.set(item.data.artifactId, {
      //          parentNodeId: targetItemType === 'collection' ? null : targetItem.data.artifactId.toString(),
      //          order,
      //        });
      //      }
      //    }
      //  }
      //
      //  if (targetItem.data.type === 'personalArtifact') {
      //    // No prompt needed, we're moving personal artifacts to personal artifacts
      //    const parentItem = items[target.targetItem];
      //    if (!parentItem.children)
      //      throw new Error("ParentItem of an item doesn't have children somehow");
      //    const lastParentChildOrder =
      //      parentItem.children[parentItem.children.length - 1]?.toString() || 'A';
      //
      //    for (const item of droppedItems) {
      //      const order = calculateOrderBetween(lastParentChildOrder, 'Z');
      //
      //      if ('artifactId' in item.data) {
      //        personalYKeyValue.set(item.data.artifactId, {
      //          parentNodeId:
      //            target.targetItem.toString() === PERSONAL_ROOT_ITEM_ID
      //              ? null
      //              : target.targetItem.toString(),
      //          order,
      //        });
      //      }
      //    }
      //  }
      //}
    }
    if (target.targetType === 'between-items') {
      if (isItemUncategorized(target.parentItem.toString())) {
        // This is unexpected since we should have already prevented this in canDropAt
        const error = new Error('Cannot drop between uncategorized items');
        console.error(error);
        Sentry.captureException(error);
        return;
      }

      if (target.parentItem.toString() === UNCATEGORIZED_ITEM_ID) {
        return;
      }

      const parentItem = items[target.parentItem];
      if (
        parentItem.data.type !== 'collection' &&
        parentItem.data.type !== 'collectionArtifact' &&
        parentItem.data.type !== 'personalArtifact' &&
        parentItem.data.type !== 'personalTreeRoot'
      ) {
        return;
      }

      if (
        droppedItems.filter((item) => item.data.type === 'collectionArtifact')
          .length !== droppedItems.length &&
        droppedItems.filter((item) => item.data.type === 'personalArtifact')
          .length !== droppedItems.length
      ) {
        // We don't allow mixing collection artifacts with personal artifacts
        return;
      }

      if (!parentItem.children)
        throw new Error("ParentItem of an item doesn't have children somehow");
      let previousItemOrder =
        items[parentItem.children?.[target.childIndex - 1] || -1]?.data.order ||
        'A';
      const nextItemOrder =
        items[parentItem.children?.[target.childIndex] || -1]?.data.order ||
        'Z';

      console.log('dropped', droppedItems);
      for (const item of droppedItems) {
        // We move this pointer to keep order consistent
        previousItemOrder = calculateOrderBetween(
          previousItemOrder,
          nextItemOrder,
        );

        if (
          item.data.type === 'collectionArtifact' ||
          item.data.type === 'personalArtifact'
        ) {
          moveArtifact({
            artifactId: item.data.artifactId,
            newCollectionId:
              ('collectionId' in parentItem.data
                ? parentItem.data.collectionId
                : null) || null,
            session,
            nodeVal: {
              parentNodeId:
                parentItem.data.type === 'collection' ||
                parentItem.data.type === 'personalTreeRoot'
                  ? null
                  : target.parentItem.toString(),
              order: previousItemOrder,
            },
          });
        }
      }
    }
  };

  /**
   * Returns true if the item is uncategorized, but is not the uncategorized header itself
   */
  const isItemUncategorized = (index: string) => {
    if (index === UNCATEGORIZED_ITEM_ID) {
      // Allow drop on "uncategorized" itself
      return false;
    }
    if (index === PERSONAL_ROOT_ITEM_ID) {
      // Always allow drop on root
      return false;
    }

    const kvEntry = personalYKeyValue.get(index);
    // When an item isn't in the kv list, it's de-facto uncategorized since it has no capability to have a parent
    if (!kvEntry) return true;

    // When an item's parent doesn't exist in our items list, the user has likely lost access to the parent or it's been deleted
    if (kvEntry.parentNodeId && !items[kvEntry.parentNodeId]) {
      return true;
    }

    return false;
  };

  console.log(items);

  return (
    <StyleContainer>
      <ControlledTreeEnvironment
        ref={(el) => {
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
            const { props } =
              customDragData as CustomDragStateData<PaneableComponent.Artifact>;

            const artifact = artifacts.find(
              (artifact) => artifact.id === props.id,
            );

            if (!artifact || artifact.userId !== session.userId) {
              // We don't support dragging shared artifacts from the pane view onto the tree at this time
              return;
            }

            el?.dragAndDropContext.onStartDraggingItems(
              [
                {
                  index: `personalTree:${props.id}`,
                  children: [],
                  isFolder: false,
                  canMove: true,
                  canRename: false,
                  data: {
                    type: 'personalArtifact',
                    aliasId: `personalTree:${props.id}`,
                    artifactId: props.id,
                    title: artifact?.title || 'Unknown',
                    order: 'X',
                  } satisfies InternalTreeItem,
                },
              ],
              PERSONAL_TREE_ID,
            );
          });
        }}
        items={items}
        getItemTitle={(item) => item.data.title}
        viewState={{
          [PERSONAL_TREE_ID]: {
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
              if (item.index === UNCATEGORIZED_ITEM_ID) {
                actions.toggleExpandedState();
                return;
              }

              if (!('artifactId' in item.data)) return;

              if (e.ctrlKey || e.metaKey) {
                navigate(
                  undefined,
                  PaneableComponent.Artifact,
                  { id: item.data.artifactId },
                  PaneTransition.NewTab,
                  true,
                );
              } else {
                navigate(
                  undefined,
                  PaneableComponent.Artifact,
                  { id: item.data.artifactId },
                  PaneTransition.Push,
                  true,
                );
              }
            },
            onDragStart: () => {
              if ('artifactId' in item.data) {
                setCustomDragData({
                  component: PaneableComponent.Artifact,
                  props: {
                    id: item.data.artifactId,
                  },
                });
              }

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
              target.parentItem.toString() !== UNCATEGORIZED_ITEM_ID &&
              !isItemUncategorized(target.parentItem.toString())
            );
          }

          return true;
        }}
        canDragAndDrop
        canDropOnFolder
        canReorderItems
        canDropOnNonFolder
        onDrop={onDrop}
        renderItem={(props) => {
          return (
            <ArtifactTreeItem
              treeRenderProps={props}
              itemsRef={itemsRef}
              expandedItemsRef={expandedItemsRef}
              setExpandedItemsRef={setExpandedItemsRef}
            />
          );
        }}
      >
        <div>
          {props.renderPersonalSection(
            <Tree treeId={PERSONAL_TREE_ID} rootItem={PERSONAL_ROOT_ITEM_ID} />,
          )}
          {props.renderCollectionSection(
            <Tree
              treeId={COLLECTION_TREE_ID}
              rootItem={COLLECTION_ROOT_ITEM_ID}
            />,
          )}
        </div>
      </ControlledTreeEnvironment>
    </StyleContainer>
  );
};
