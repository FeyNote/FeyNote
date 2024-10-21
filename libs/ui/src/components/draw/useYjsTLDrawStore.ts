import { ImmediateDebouncer } from '@feynote/shared-utils';
import { TiptapCollabProvider } from '@hocuspocus/provider';
import { useEffect, useMemo, useState } from 'react';
import {
  computed,
  createPresenceStateDerivation,
  createTLStore,
  debounce,
  defaultShapeUtils,
  defaultUserPreferences,
  getUserPreferences,
  HistoryEntry,
  InstancePresenceRecordType,
  react,
  SerializedSchema,
  setUserPreferences,
  StoreListener,
  TLAnyShapeUtilConstructor,
  TLInstancePresence,
  TLRecord,
  TLStoreWithStatus,
} from 'tldraw';
import { YKeyValue } from 'y-utility/y-keyvalue';
import { Doc as YDoc, Transaction as YTransaction } from 'yjs';

const YJS_PERSIST_INTERVAL_MS = 1000;
const AWARENESS_PUBLISH_INTERVAL_MS = 20;

/* ------ These keys must not be changed ------ */
// If changed without some type of data migration, all data in all documents will be lost
const TLDRAW_YDOC_STORE_KEY = 'tldrawStore';
const TLDRAW_YDOC_META_KEY = 'tldrawMeta';
const TLDRAW_YDOC_META_SCHEMA_KEY = 'schema';
/* ------ These keys must not be changed ------ */

export const useYjsTLDrawStore = ({
  yProvider,
  shapeUtils,
  editable = true,
}: {
  yProvider: TiptapCollabProvider;
  shapeUtils: TLAnyShapeUtilConstructor[];
  editable: boolean;
}) => {
  const [store] = useState(() => {
    const store = createTLStore({
      shapeUtils: [...defaultShapeUtils, ...shapeUtils],
    });

    return store;
  });

  const [storeWithStatus, setStoreWithStatus] = useState<TLStoreWithStatus>({
    status: 'loading',
  });

  const _awareness = yProvider.awareness;
  if (!_awareness) {
    throw new Error(
      'Awareness not enabled and is required for our custom tldraw yjs store',
    );
  }
  const awareness = _awareness;

  const { yStore, yMeta, yDoc } = useMemo(() => {
    const yDoc = yProvider.document;
    const yStore = new YKeyValue(
      yDoc.getArray<{ key: string; val: TLRecord }>(TLDRAW_YDOC_STORE_KEY),
    );
    const yMeta = yDoc.getMap<SerializedSchema>(TLDRAW_YDOC_META_KEY);

    return {
      yDoc,
      yStore,
      yMeta,
    };
  }, [yProvider]);

  useEffect(() => {
    let lastReceivedAt = Date.now();
    const awarenessChangeListener = () => {
      const others: any = awareness?.getStates() ?? [];
      others.forEach((value: any, clientID: number) => {
        if (clientID === awareness?.clientID) return;
        try {
          const actions = value.actions as
            | { t: number; shapes: TLRecord[] }
            | undefined;
          if (!actions) return;
          const { t, shapes } = actions;
          if (shapes && t > lastReceivedAt) {
            store.mergeRemoteChanges(() => store.put(shapes.filter((s) => s)));
            lastReceivedAt = t;
          }
        } catch (e) {
          console.error(e);
        }
      });
    };
    awareness.on('change', awarenessChangeListener);
    return () => {
      awareness.off('change', awarenessChangeListener);
    };
  });

  useEffect(() => {
    setStoreWithStatus({ status: 'loading' });

    const unsubs: (() => void)[] = [];

    // Connect store to yjs store and vis versa, for both the document and awareness

    /* -------------------- Document -------------------- */

    // Sync store changes to the yjs doc
    const processingBuffer = new Set<string>();
    const flush = debounce(() => {
      yDoc.transact(() => {
        for (const id of processingBuffer) {
          const record = store.get(id as any);
          if (record) {
            yStore.set(id, record as any);
          } else {
            yStore.delete(id);
          }
        }
        processingBuffer.clear();
      });
    }, YJS_PERSIST_INTERVAL_MS);

    const listener = new ImmediateDebouncer(
      ({ changes }: HistoryEntry<TLRecord>): void => {
        if (!editable) return;
        // Always add to currentBuffer

        const temp: TLRecord[] = [];

        Object.values(changes.added).forEach((record) => {
          processingBuffer.add(record.id);
          temp.push(record);
        });
        Object.values(changes.updated).forEach(([_, record]) => {
          processingBuffer.add(record.id);
          temp.push(record);
        });
        Object.values(changes.removed).forEach((record) => {
          processingBuffer.add(record.id);
        });

        awareness.setLocalStateField('actions', {
          t: Date.now(),
          shapes: temp,
        });
        flush();
      },
      AWARENESS_PUBLISH_INTERVAL_MS,
      {
        enableFollowupCall: true,
      },
    );

    function handleSync() {
      unsubs.push(
        store.listen(
          (changes) => listener.call(undefined, changes),
          { source: 'user', scope: 'document' }, // only sync user's document changes
        ),
      );

      // Sync the yjs doc changes to the store
      const handleChange = (
        changes: Map<
          string,
          | { action: 'delete'; oldValue: TLRecord }
          | { action: 'update'; oldValue: TLRecord; newValue: TLRecord }
          | { action: 'add'; newValue: TLRecord }
        >,
        transaction: YTransaction,
      ) => {
        if (transaction.local) return;

        const toRemove: TLRecord['id'][] = [];
        const toPut: TLRecord[] = [];

        changes.forEach((change, id) => {
          switch (change.action) {
            case 'add':
            case 'update': {
              const record = yStore.get(id)!;
              toPut.push(record);
              break;
            }
            case 'delete': {
              toRemove.push(id as TLRecord['id']);
              break;
            }
          }
        });

        // put / remove the records in the store
        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };

      yStore.on('change', handleChange);
      unsubs.push(() => yStore.off('change', handleChange));

      /* -------------------- Awareness ------------------- */

      const yClientId = awareness.clientID.toString();
      setUserPreferences({ id: yClientId });

      const userPreferences = computed<{
        id: string;
        color: string;
        name: string;
      }>('userPreferences', () => {
        const user = getUserPreferences();
        return {
          id: user.id,
          color: user.color ?? defaultUserPreferences.color,
          name: user.name ?? defaultUserPreferences.name,
        };
      });

      // Create the instance presence derivation
      const presenceId = InstancePresenceRecordType.createId(yClientId);
      const presenceDerivation = createPresenceStateDerivation(
        userPreferences,
        presenceId,
      )(store);

      // Set our initial presence from the derivation's current value
      awareness.setLocalStateField('presence', presenceDerivation.get());

      // When the derivation change, sync presence to to yjs awareness
      unsubs.push(
        react('when presence changes', () => {
          const presence = presenceDerivation.get();
          requestAnimationFrame(() => {
            awareness.setLocalStateField('presence', presence);
          });
        }),
      );

      // Sync yjs awareness changes to the store
      const handleUpdate = (update: {
        added: number[];
        updated: number[];
        removed: number[];
      }) => {
        const states = awareness.getStates() as Map<
          number,
          { presence: TLInstancePresence }
        >;

        const toRemove: TLInstancePresence['id'][] = [];
        const toPut: TLInstancePresence[] = [];

        // Connect records to put / remove
        for (const clientId of update.added) {
          const state = states.get(clientId);
          if (state?.presence && state.presence.id !== presenceId) {
            toPut.push(state.presence);
          }
        }

        for (const clientId of update.updated) {
          const state = states.get(clientId);
          if (state?.presence && state.presence.id !== presenceId) {
            toPut.push(state.presence);
          }
        }

        for (const clientId of update.removed) {
          toRemove.push(
            InstancePresenceRecordType.createId(clientId.toString()),
          );
        }

        // put / remove the records in the store
        store.mergeRemoteChanges(() => {
          if (toRemove.length) store.remove(toRemove);
          if (toPut.length) store.put(toPut);
        });
      };

      const handleMetaUpdate = () => {
        const theirSchema = yMeta.get(TLDRAW_YDOC_META_SCHEMA_KEY);
        if (!theirSchema) {
          throw new Error('No schema found in the yjs doc');
        }
        // If the shared schema is newer than our schema, the user must refresh
        const newMigrations = store.schema.getMigrationsSince(theirSchema);

        if (!newMigrations.ok || newMigrations.value.length > 0) {
          window.alert('The schema has been updated. Please refresh the page.');
          yProvider.destroy();
        }
      };
      yMeta.observe(handleMetaUpdate);
      unsubs.push(() => yMeta.unobserve(handleMetaUpdate));

      awareness.on('update', handleUpdate);
      unsubs.push(() => awareness.off('update', handleUpdate));

      // 2.
      // Initialize the store with the yjs doc records—or, if the yjs doc
      // is empty, initialize the yjs doc with the default store records.
      if (yStore.yarray.length) {
        // Replace the store records with the yjs doc records
        const ourSchema = store.schema.serialize();
        const theirSchema = yMeta.get(TLDRAW_YDOC_META_SCHEMA_KEY);
        if (!theirSchema) {
          throw new Error('No schema found in the yjs doc');
        }

        const records = yStore.yarray.toJSON().map(({ val }) => val);

        const migrationResult = store.schema.migrateStoreSnapshot({
          schema: theirSchema,
          store: Object.fromEntries(
            records.map((record) => [record.id, record]),
          ),
        });
        if (migrationResult.type === 'error') {
          // if the schema is newer than ours, the user must refresh
          console.error(migrationResult.reason);
          window.alert('The schema has been updated. Please refresh the page.');
          return;
        }

        yDoc.transact(() => {
          // delete any deleted records from the yjs doc
          for (const r of records) {
            if (!migrationResult.value[r.id]) {
              yStore.delete(r.id);
            }
          }
          for (const r of Object.values(migrationResult.value) as TLRecord[]) {
            yStore.set(r.id, r);
          }
          yMeta.set(TLDRAW_YDOC_META_SCHEMA_KEY, ourSchema);
        });

        store.loadSnapshot({
          store: migrationResult.value,
          schema: ourSchema,
        });
      } else {
        // Create the initial store records
        // Sync the store records to the yjs doc
        yDoc.transact(() => {
          for (const record of store.allRecords()) {
            yStore.set(record.id, record);
          }
          yMeta.set(TLDRAW_YDOC_META_SCHEMA_KEY, store.schema.serialize());
        });
      }

      setStoreWithStatus({
        store,
        status: 'synced-remote',
        connectionStatus: 'online',
      });
    }

    let hasConnectedBefore = false;

    function handleStatusChange({
      status,
    }: {
      status: 'disconnected' | 'connected';
    }) {
      // If we're disconnected, set the store status to 'synced-remote' and the connection status to 'offline'
      if (status === 'disconnected') {
        setStoreWithStatus({
          store,
          status: 'synced-remote',
          connectionStatus: 'offline',
        });
        return;
      }

      yProvider.off('synced', handleSync);

      if (status === 'connected') {
        if (hasConnectedBefore) return;
        hasConnectedBefore = true;
        yProvider.on('synced', handleSync);
        unsubs.push(() => yProvider.off('synced', handleSync));
      }
    }

    yProvider.on('status', handleStatusChange);
    unsubs.push(() => yProvider.off('status', handleStatusChange));
    handleStatusChange({ status: yProvider.status as any });
    if (yProvider.synced) handleSync();

    return () => {
      unsubs.forEach((fn) => fn());
      unsubs.length = 0;
    };
  }, [yProvider, yDoc, store, yStore, yMeta]);

  return storeWithStatus;
};
