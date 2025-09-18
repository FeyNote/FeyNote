import { deleteDB } from 'idb';
import * as Sentry from '@sentry/browser';
import type { SearchManager } from '../SearchManager';
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import { getApiUrls } from '../getApiUrls';
import { Doc, type XmlElement as YXmlElement, type YEvent } from 'yjs';
import { trpc } from '../trpc';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  Edge,
  getEdgeId,
  getMetaFromYArtifact,
  getTiptapIdsFromYEvent,
  getUserAccessFromYArtifact,
  ImmediateDebouncer,
  type Manifest,
} from '@feynote/shared-utils';
import { getManifestDb, KVStoreKeys, ObjectStoreName } from '../localDb';
import { waitFor } from '../waitFor';
import { appIdbStorageManager } from '../AppIdbStorageManager';
import { websocketClient } from '../../context/events/websocketClient';
import { eventManager } from '../../context/events/EventManager';
import { EventName } from '../../context/events/EventName';
import { getIsViteDevelopment } from '../getIsViteDevelopment';
websocketClient.connect();

enum SyncReason {
  VersionNotPresentInLocal = 'versionNotPresentInLocal',
  VersionNotPresentInRemote = 'versionNotPresentInRemote',
  VersionNotMatch = 'versionNotMatch',
  SearchNotPresentInLocal = 'searchNotPresentInLocal',
  SearchNotPresentInRemote = 'searchNotPresentInRemote',
  SnapshotNotPresentInLocal = 'snapshotNotPresentInLocal',
  SnapshotNotPresentInRemote = 'snapshotNotPresentInRemote',
}

const syncReasonHuman = {
  [SyncReason.VersionNotPresentInLocal]: 'versionNotPresentInLocal',
  [SyncReason.VersionNotPresentInRemote]: 'versionNotPresentInRemote',
  [SyncReason.VersionNotMatch]: 'versionNotMatch',
  [SyncReason.SearchNotPresentInLocal]: 'searchNotPresentInLocal',
  [SyncReason.SearchNotPresentInRemote]: 'searchNotPresentInRemote',
  [SyncReason.SnapshotNotPresentInLocal]: 'snapshotNotPresentInLocal',
  [SyncReason.SnapshotNotPresentInRemote]: 'snapshotNotPresentInRemote',
};

class AbortedSyncError extends Error {
  constructor() {
    super();
    this.name = 'AbortSyncError';
  }
}

/**
 * When enabled, you'll see a lot of logs to help understand what's going on
 * while syncing.
 * Note that only Chrome supports module-based service workers, and our Vite local-dev uses that.
 */
const ENABLE_VERBOSE_SYNC_LOGGING = getIsViteDevelopment();

/**
 * How long an artifact can take to sync before we consider it timed out and kill it.
 */
const ARTIFACT_SYNC_TIMEOUT_MS = 10 * 1000;

/**
 * The shortest time between attempted syncs.
 * This is for the sanity of our server, since constant editing would re-trigger sync
 * constantly.
 */
const MANIFEST_MIN_SYNC_INTERVAL_MS = 15 * 1000;

/**
 * This sets the upper bound for how long a sync can take before getting timed out.
 * A sync that gets timed out will get resumed from where it left off.
 * This is to prevent deadlocks.
 */
const SYNC_LOCK_ABORT_TIMEOUT_MINUTES = 6;

/**
 * How many artifacts to sync at once
 */
const SYNC_BATCH_SIZE = 5;

/**
 * How long to wait between syncing each batch
 */
const SYNC_BATCH_RATE_LIMIT_WAIT = 1 * 1000;

export class SyncManager {
  private currentSyncPromise: Promise<void> | null = null;

  constructor(private searchManager: SearchManager) {
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

    eventManager.addEventListener(EventName.ArtifactUpdated, () => {
      if (ENABLE_VERBOSE_SYNC_LOGGING)
        console.log('Artifact updated, queueing sync');
      syncManifestDebouncer.call();
    });

    eventManager.addEventListener(EventName.LocaldbSessionUpdated, () => {
      if (ENABLE_VERBOSE_SYNC_LOGGING)
        console.log('Session updated, queueing sync');
      syncManifestDebouncer.call();
    });
  }

  getDocName(artifactId: string): string {
    return `artifact:${artifactId}`;
  }

  public async syncManifest(): Promise<void> {
    const abortSignal = AbortSignal.timeout(
      SYNC_LOCK_ABORT_TIMEOUT_MINUTES * 60 * 1000,
    );

    if ('locks' in navigator) {
      return navigator.locks.request(
        'feynote-sync',
        {
          mode: 'exclusive',
          ifAvailable: true,
        },
        (lock) => {
          if (!lock) {
            console.warn('Sync already in progress in another tab/worker');
            return;
          }
          return this._syncManifest(abortSignal);
        },
      );
    } else {
      // Not as safe, since we cannot guarntee we're the only tab/worker syncing
      if (this.currentSyncPromise) {
        console.log('Sync already in progress');
        return this.currentSyncPromise;
      }

      this.currentSyncPromise = this._syncManifest(abortSignal).finally(() => {
        this.currentSyncPromise = null;
      });

      return this.currentSyncPromise;
    }
  }

  private async _syncCheckAbort(signal: AbortSignal) {
    if (signal.aborted) throw new AbortedSyncError();
  }

  private async _syncManifest(signal: AbortSignal): Promise<void> {
    const session = await appIdbStorageManager.getSession();
    if (!session) {
      console.log('Not logged in, will not perform sync.');
      return;
    }

    performance.mark('startSync');

    console.log(`Beginning sync for ${session.email}`);

    this._syncCheckAbort(signal);
    await this.searchManager.onReady();
    this._syncCheckAbort(signal);
    const manifestDb = await getManifestDb();

    try {
      // We do not need to wait on the known user sync
      this.syncKnownUsers().catch((e) => {
        console.error('Known user sync failed', e);
        Sentry.captureException(e);
      });

      this._syncCheckAbort(signal);
      const latestManifest = await trpc.user.getManifest.query();

      // ==== Update Artifact References ====
      {
        // Wrapped in a lexical context for memory optimization
        const modifiedEdgeArtifactIds = new Set<string>();
        this._syncCheckAbort(signal);

        const edgesTx = manifestDb.transaction(
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
          this._syncCheckAbort(signal);
          const edgeId = getEdgeId(edge);
          const localEdge = localEdgesById.get(edgeId);
          if (
            !localEdge ||
            localEdge.referenceText !== edge.referenceText ||
            localEdge.artifactDeleted !== edge.artifactDeleted ||
            localEdge.artifactTitle !== edge.artifactTitle ||
            localEdge.targetArtifactTitle !== edge.targetArtifactTitle ||
            localEdge.targetArtifactDeleted !== edge.targetArtifactDeleted
          ) {
            await edgesStore.put({
              ...edge,
              targetArtifactBlockId: edge.targetArtifactBlockId || '', // This must be done since it's part of the index and indexeddb requires index values be non-null
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

        if (modifiedEdgeArtifactIds.size) {
          eventManager.broadcast(EventName.LocaldbEdgesUpdated, {
            modifiedEdgeArtifactIds: [...modifiedEdgeArtifactIds],
          });
        }
      }

      // ==== Update Artifacts ====
      const needsSync = new Set<string>();

      {
        // Wrapped in a lexical context for memory optimization
        this._syncCheckAbort(signal);
        const localArtifactSnapshotKeyRecords = await manifestDb.getAllKeys(
          ObjectStoreName.ArtifactSnapshots,
        );
        const localArtifactSnapshotKeys = new Set(
          localArtifactSnapshotKeyRecords,
        );
        const localArtifactVersionsRecords = await manifestDb.getAll(
          ObjectStoreName.ArtifactVersions,
        );
        const localArtifactVersions: Record<string, number> = {};
        for (const record of localArtifactVersionsRecords) {
          localArtifactVersions[record.id] = record.version;
        }

        const artifactSyncReasons: Record<string, SyncReason[]> = {};
        const addArtifactSyncReason = (
          artifactId: string,
          syncReason: SyncReason,
        ) => {
          const syncedReasons = (artifactSyncReasons[artifactId] ||= []);
          syncedReasons.push(syncReason);
          needsSync.add(artifactId);
        };

        // Check for artifact records present on manifest, but not on client
        this._syncCheckAbort(signal);
        const searchIndexKnownArtifactIds =
          this.searchManager.getKnownIndexIds();
        for (const artifactId of Object.keys(latestManifest.artifactVersions)) {
          if (!localArtifactVersions[artifactId]) {
            addArtifactSyncReason(
              artifactId,
              SyncReason.VersionNotPresentInLocal,
            );
          } else if (
            localArtifactVersions[artifactId] !==
            latestManifest.artifactVersions[artifactId]
          ) {
            addArtifactSyncReason(artifactId, SyncReason.VersionNotMatch);
          }
          if (!localArtifactSnapshotKeys.has(artifactId)) {
            addArtifactSyncReason(
              artifactId,
              SyncReason.SnapshotNotPresentInLocal,
            );
          }
          if (!searchIndexKnownArtifactIds.has(artifactId)) {
            addArtifactSyncReason(
              artifactId,
              SyncReason.SearchNotPresentInLocal,
            );
          }
        }

        // Check for artifact records present locally, but not present in the manifest
        for (const artifactId of Object.keys(localArtifactVersions)) {
          if (!latestManifest.artifactVersions[artifactId]) {
            addArtifactSyncReason(
              artifactId,
              SyncReason.VersionNotPresentInRemote,
            );
          }
        }
        for (const artifactId of localArtifactSnapshotKeys) {
          if (!latestManifest.artifactVersions[artifactId]) {
            addArtifactSyncReason(
              artifactId,
              SyncReason.SnapshotNotPresentInRemote,
            );
          }
        }
        for (const [artifactId] of searchIndexKnownArtifactIds) {
          if (!latestManifest.artifactVersions[artifactId]) {
            addArtifactSyncReason(
              artifactId,
              SyncReason.SearchNotPresentInRemote,
            );
          }
        }

        if (ENABLE_VERBOSE_SYNC_LOGGING) {
          for (const [id, reasons] of Object.entries(artifactSyncReasons)) {
            const humanReasons = reasons
              .map((reason) => syncReasonHuman[reason])
              .join(',');
            console.log(`Syncing ${id} because: ${humanReasons}`);
          }
        }
      }

      this._syncCheckAbort(signal);
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

        for (const batch of batches) {
          await Promise.all(
            batch.map((artifactId) => {
              this._syncCheckAbort(signal);
              return this.sync(artifactId, latestManifest, ws);
            }),
          );
          await waitFor(SYNC_BATCH_RATE_LIMIT_WAIT);
        }

        ws.destroy();
      }

      await manifestDb.put(ObjectStoreName.KV, {
        key: KVStoreKeys.LastSyncedAt,
        value: new Date(),
      });
      eventManager.broadcast(EventName.LocaldbSyncCompleted);
      performance.mark('endSync');
      const measure = performance.measure('syncTime', 'startSync', 'endSync');
      console.log(
        `Syncing completed in ${measure.duration}ms. ${needsSync.size} items attempted.`,
      );
    } catch (e) {
      console.error('Sync failed', e);
      if (!(e instanceof AbortedSyncError)) {
        Sentry.captureException(e);
      }
    }
  }

  private async sync(
    artifactId: string,
    manifest: Manifest,
    ws: HocuspocusProviderWebsocket,
  ): Promise<void> {
    const docName = this.getDocName(artifactId);
    console.log('Syncing', docName);
    const session = await appIdbStorageManager.getSession();
    if (!session) throw new Error('ERROR: Sync initiated without a token');

    const manifestDb = await getManifestDb();
    const snapshot = await manifestDb.get(
      ObjectStoreName.ArtifactSnapshots,
      artifactId,
    );

    if (
      !manifest.artifactVersions[artifactId] && // The manifest is the source of truth, since we require creations/deletions to happen synchronously without hocuspocus write-delay
      !snapshot?.createdLocally // Artifacts created locally will not exist on the manifest
    ) {
      // Artifact exists on client but not on server

      await manifestDb.delete(ObjectStoreName.ArtifactVersions, artifactId);
      await manifestDb.delete(ObjectStoreName.ArtifactSnapshots, artifactId);
      await this.searchManager.unindexArtifact(artifactId);
      try {
        await deleteDB(`artifact:${artifactId}`);
      } catch (_e) {
        // Do nothing
      }
      if (ENABLE_VERBOSE_SYNC_LOGGING)
        console.log(`Deleting ${artifactId} because it's not on the manifest`);

      eventManager.broadcast(EventName.LocaldbArtifactSnapshotUpdated, {
        artifactId,
      });

      return;
    }

    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    await indexeddbProvider.whenSynced;

    if (snapshot?.createdLocally) {
      const meta = getMetaFromYArtifact(doc);
      await trpc.artifact.createArtifact.mutate({
        id: artifactId,
        title: meta.title,
        theme: meta.theme,
        type: meta.type,
        linkAccessLevel: meta.linkAccessLevel,
        createdAt: new Date(meta.createdAt),
        deletedAt: meta.deletedAt ? new Date(meta.deletedAt) : undefined,
      });
    }

    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: session.token,
      websocketProvider: ws,
      awareness: null,
    });

    // Note: These do not listen for transaction.local but I'm generally okay with that, since
    // search _can_ fall out of sync in rare cases (browser crash, etc).
    // This isn't the worst performing thing to do, and we might as well be reindexing everything
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
    doc
      .getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY)
      .observeDeep(docObserveListener);
    doc.getMap(ARTIFACT_META_KEY).observeDeep(metaObserveListener);

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

    // This is required in Hocuspocus v3 when using a manually-managed websocket instance.
    // It wires up all of the internal event listeners.
    tiptapCollabProvider.attach();

    const result = await Promise.race([timeout, ttpSyncP]);

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

    await appIdbStorageManager.updateLocalArtifactSnapshot(
      artifactId,
      {
        meta: getMetaFromYArtifact(doc),
        userAccess: Array.from(getUserAccessFromYArtifact(doc).map.values()),
        updatedAt: manifest.artifactVersions[artifactId],
        createdLocally: false, // We set this to false now that the server has this artifact, which means it's synced and no longer needs to be preserved.
      },
      {
        create: true,
        createdLocally: false,
      },
    );

    // We do this as one of the very last steps, since we're effectively saying "we're up to date now"
    await manifestDb.put(ObjectStoreName.ArtifactVersions, {
      id: artifactId,
      version: manifest.artifactVersions[artifactId],
    });

    doc
      .getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY)
      .unobserveDeep(docObserveListener);
    doc.getMap(ARTIFACT_META_KEY).unobserveDeep(metaObserveListener);
    tiptapCollabProvider.destroy();
    await indexeddbProvider.destroy();
  }

  async syncKnownUsers() {
    const manifestDb = await getManifestDb();

    const knownUsers = await trpc.user.getKnownUsers.query().catch(() => {
      // Do nothing
    });
    if (!knownUsers) return;

    const knownUsersTx = manifestDb.transaction(
      ObjectStoreName.KnownUsers,
      'readwrite',
    );
    const knownUsersStore = knownUsersTx.store;
    await knownUsersStore.clear();
    for (const knownUser of knownUsers) {
      await knownUsersStore.add(knownUser);
    }
    await knownUsersTx.done;

    eventManager.broadcast(EventName.LocaldbKnownUsersUpdated);
  }
}
