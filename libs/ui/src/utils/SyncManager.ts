import { deleteDB, IDBPDatabase } from 'idb';
import type { SearchManager } from './SearchManager';
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import { getApiUrls } from './getApiUrls';
import {
  Doc,
  encodeStateAsUpdate,
  type XmlElement as YXmlElement,
  type YEvent,
} from 'yjs';
import { trpc } from './trpc';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  Edge,
  getEdgeId,
  getTiptapIdsFromYEvent,
  ImmediateDebouncer,
} from '@feynote/shared-utils';
import { ObjectStoreName } from './localDb';
import { waitFor } from './waitFor';
import { appIdbStorageManager } from './AppIdbStorageManager';
import { websocketClient } from '../context/events/websocketClient';
import { eventManager } from '../context/events/EventManager';
import { EventName } from '../context/events/EventName';
import { getIsViteDevelopment } from './getIsViteDevelopment';
websocketClient.connect();

const broadcastChannel = new BroadcastChannel('edges.updated');

const ENABLE_VERBOSE_SYNC_LOGGING = getIsViteDevelopment();
/**
 * How long an artifact can take to sync before we consider it timed out and kill it
 */
const ARTIFACT_SYNC_TIMEOUT_MS = 10 * 1000;

const MANIFEST_MIN_SYNC_INTERVAL_MS = 15 * 1000;

/**
 * How many artifacts to sync at once
 */
const SYNC_BATCH_SIZE = 5;

/**
 * How long to wait between syncing each batch
 * NOTE: This must not be longer than our server WS timeout - Hocuspocus default is 15 seconds
 */
const SYNC_BATCH_RATE_LIMIT_WAIT = 1 * 1000;

export class SyncManager {
  private currentSyncPromise: Promise<void> | null = null;

  constructor(
    private manifestDb: IDBPDatabase,
    private searchManager: SearchManager,
  ) {
    const syncManifestDebouncer = new ImmediateDebouncer(
      () => {
        this.syncManifest();
      },
      MANIFEST_MIN_SYNC_INTERVAL_MS,
      {
        enableFollowupCall: true,
      },
    );
    this.syncManifest();

    eventManager.addEventListener([EventName.ArtifactUpdated], () => {
      if (ENABLE_VERBOSE_SYNC_LOGGING)
        console.log('Artifact updated, queueing sync');
      syncManifestDebouncer.call();
    });
  }

  getDocName(artifactId: string): string {
    return `artifact:${artifactId}`;
  }

  public async syncManifest(): Promise<void> {
    if (this.currentSyncPromise) {
      console.log('Sync already in progress');
      return this.currentSyncPromise;
    }

    this.currentSyncPromise = this._syncManifest().finally(() => {
      this.currentSyncPromise = null;
    });

    return this.currentSyncPromise;
  }

  private async _syncManifest(): Promise<void> {
    const session = await appIdbStorageManager.getSession();
    if (!session) {
      console.log('Not logged in, will not perform sync.');
      return;
    }

    performance.mark('startSync');

    console.log(`Beginning sync for ${session.email}`);

    await this.searchManager.onReady();

    try {
      const latestManifest = await trpc.user.getManifest.query();

      // ==== Update Artifact References ====
      const modifiedEdgeArtifactIds = new Set<string>();
      const edgesTx = this.manifestDb.transaction(
        ObjectStoreName.Edges,
        'readwrite',
      );
      const edgesStore = edgesTx.store;
      const localEdges = await edgesStore.getAll();
      const localEdgesById = new Map<string, Edge>(
        localEdges.map((edge) => [edge.id, edge]),
      );
      const remoteEdgeIds = new Set(latestManifest.edges.map((el) => el.id));

      for (const edge of latestManifest.edges) {
        const edgeId = getEdgeId(edge);
        const localEdge = localEdgesById.get(edgeId);
        if (
          !localEdge ||
          localEdge.referenceText !== edge.referenceText ||
          localEdge.isBroken !== edge.isBroken ||
          localEdge.artifactTitle !== edge.artifactTitle ||
          localEdge.targetArtifactTitle !== edge.targetArtifactTitle
        ) {
          await edgesStore.put({
            ...edge,
            targetArtifactBlockId: edge.targetArtifactBlockId || '',
            id: edgeId,
          });
          modifiedEdgeArtifactIds.add(edge.artifactId);
          modifiedEdgeArtifactIds.add(edge.targetArtifactId);
        }
      }

      for (const localEdge of localEdges) {
        if (!remoteEdgeIds.has(localEdge.id)) {
          await edgesStore.delete(localEdge.id);
          modifiedEdgeArtifactIds.add(localEdge.artifactId);
          modifiedEdgeArtifactIds.add(localEdge.targetArtifactId);
        }
      }

      await edgesTx.done;

      broadcastChannel.postMessage({
        modifiedEdgeArtifactIds: [...modifiedEdgeArtifactIds],
      });

      // ==== Update Artifacts ====
      const localArtifactVersionsRecords = await this.manifestDb.getAll(
        ObjectStoreName.ArtifactVersions,
      );
      const localArtifactVersions: Record<string, number> = {};
      for (const record of localArtifactVersionsRecords) {
        localArtifactVersions[record.id] = record.version;
      }

      const needsSync = new Set<string>();

      for (const [artifactId, version] of Object.entries(
        latestManifest.artifactVersions,
      )) {
        if (!localArtifactVersions[artifactId]) {
          // Exists on server, but does not exist on client
          await this.manifestDb.add(ObjectStoreName.ArtifactVersions, {
            id: artifactId,
            version,
          });
          needsSync.add(artifactId);
          if (ENABLE_VERBOSE_SYNC_LOGGING)
            console.log(
              `Adding ${artifactId} to sync queue because it's not present locally`,
            );
        } else if (localArtifactVersions[artifactId] !== version) {
          // Exists on server, but versions do not match
          await this.manifestDb.put(ObjectStoreName.ArtifactVersions, {
            id: artifactId,
            version,
          });
          needsSync.add(artifactId);
          if (ENABLE_VERBOSE_SYNC_LOGGING)
            console.log(
              `Adding ${artifactId} to sync queue because the local version does not match the server version`,
            );
        }
      }

      const searchIndexKnownArtifactIds = this.searchManager.getKnownIndexIds();
      for (const [artifactId] of Object.entries(
        latestManifest.artifactVersions,
      )) {
        if (!searchIndexKnownArtifactIds.has(artifactId)) {
          // Exists on server but not in local search index
          needsSync.add(artifactId);
          if (ENABLE_VERBOSE_SYNC_LOGGING)
            console.log(
              `Adding ${artifactId} to sync queue because it's missing in local search index`,
            );
        }
      }
      for (const artifactId of searchIndexKnownArtifactIds.keys()) {
        if (!latestManifest.artifactVersions[artifactId]) {
          // Exists in local search index but not on server
          await this.searchManager.unindexArtifact(artifactId);
          if (ENABLE_VERBOSE_SYNC_LOGGING)
            console.log(
              `Deindexing ${artifactId} because it's not on the manifest`,
            );
        }
      }

      for (const [artifactId] of Object.entries(localArtifactVersions)) {
        if (!latestManifest.artifactVersions[artifactId]) {
          // Exists on client, but does not exist on server

          await this.manifestDb.delete(
            ObjectStoreName.ArtifactVersions,
            artifactId,
          );
          await this.searchManager.unindexArtifact(artifactId);
          try {
            await deleteDB(`artifact:${artifactId}`);
          } catch (_e) {
            // Do nothing
          }
          if (ENABLE_VERBOSE_SYNC_LOGGING)
            console.log(
              `Deleting ${artifactId} because it's not on the manifest`,
            );
        }
      }

      if (needsSync.size) {
        // We instantiate a fresh websocket every time, since websockets get killed/closed
        // when left hanging without presence/awareness enabled
        const ws = new HocuspocusProviderWebsocket({
          url: getApiUrls().hocuspocus,
          delay: 50,
          minDelay: 50,
          maxDelay: 1000,
        });

        // We must operate in batches, because loading every single document in existence at the same time is dumb.
        const batches = [...needsSync].reduce((batches, id) => {
          const previousBatch = batches.at(-1);
          if (previousBatch && previousBatch.length < SYNC_BATCH_SIZE) {
            previousBatch.push(id);
          } else {
            const newBatch = [id];
            batches.push(newBatch);
          }

          return batches;
        }, [] as string[][]);

        const cleanupFns = [];
        for (const batch of batches) {
          const _cleanupFns = await Promise.all(
            batch.map((artifactId) => {
              return this.sync(artifactId, ws);
            }),
          );
          cleanupFns.push(..._cleanupFns);
          await waitFor(SYNC_BATCH_RATE_LIMIT_WAIT);
        }

        await Promise.all(cleanupFns.map((cleanupFn) => cleanupFn?.()));

        ws.destroy();
      }

      performance.mark('endSync');
      const measure = performance.measure('syncTime', 'startSync', 'endSync');
      console.log(
        `Syncing completed in ${measure.duration}ms. ${needsSync.size} items attempted.`,
      );
    } catch (e) {
      console.error('Sync failed', e);
    }
  }

  private async sync(
    artifactId: string,
    ws: HocuspocusProviderWebsocket,
  ): Promise<(() => Promise<void>) | undefined> {
    const docName = this.getDocName(artifactId);
    console.log('Syncing', docName);
    const session = await appIdbStorageManager.getSession();
    if (!session) throw new Error('ERROR: Sync initiated without a token');
    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: session.token,
      websocketProvider: ws,
      preserveConnection: false,
      awareness: null,
    });

    const metaObserveListener = async () => {
      await this.searchManager.indexPartialArtifact(artifactId, doc, []);
    };

    const docObserveListener = async (yEvents: YEvent<YXmlElement>[]) => {
      const changedIds = yEvents.map(getTiptapIdsFromYEvent).flat();

      if (!this.searchManager.getKnownIndexIds().has(artifactId)) {
        await this.searchManager.indexPartialArtifact(artifactId, doc, 'all');
      } else {
        await this.searchManager.indexPartialArtifact(
          artifactId,
          doc,
          changedIds,
        );
      }
    };
    // TODO: this observeDeep call likely picks up every single applied change even from our own IndexeddbPersistence provider
    // not just incoming changes from the HocuspocusProvider
    doc
      .getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY)
      .observeDeep(docObserveListener);
    doc.getMap(ARTIFACT_META_KEY).observeDeep(metaObserveListener);

    const idbSyncP = new Promise<void>((resolve) => {
      indexeddbProvider.on('synced', () => {
        resolve();
      });
    });
    const ttpSyncP = new Promise<void>((resolve) => {
      tiptapCollabProvider.on('synced', () => {
        resolve();
      });
    });
    const timeout = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, ARTIFACT_SYNC_TIMEOUT_MS);
    });

    const result = await Promise.race([
      timeout,
      Promise.all([idbSyncP, ttpSyncP]),
    ]);

    if (tiptapCollabProvider.authorizedScope) {
      await appIdbStorageManager.setAuthorizedCollaborationScope(
        docName,
        tiptapCollabProvider.authorizedScope,
      );
    }

    if (result === false) {
      console.error(
        `Sync attempt for ${artifactId} timed out after ${ARTIFACT_SYNC_TIMEOUT_MS / 1000} seconds!`,
      );
    }

    this.manifestDb.put(ObjectStoreName.ArtifactSnapshots, {
      id: artifactId,
      meta: doc.getMap(ARTIFACT_META_KEY).toJSON(),
      yDoc: encodeStateAsUpdate(doc),
    });

    return async () => {
      doc
        .getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY)
        .unobserveDeep(docObserveListener);
      doc.getMap(ARTIFACT_META_KEY).unobserveDeep(metaObserveListener);
      tiptapCollabProvider.destroy();
      await indexeddbProvider.destroy();
    };
  }
}
