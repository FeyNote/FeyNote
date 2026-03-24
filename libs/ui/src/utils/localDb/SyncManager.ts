import { deleteDB } from 'idb';
import * as Sentry from '@sentry/browser';
import type { SearchManager } from './SearchManager';
import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import { getApiUrls } from '../getApiUrls';
import { Doc, encodeStateAsUpdate } from 'yjs';
import { trpc } from '../trpc';
import { IndexeddbPersistence } from 'y-indexeddb';
import {
  Edge,
  getEdgeId,
  getMetaFromYArtifact,
  getUserAccessFromYArtifact,
  getWorkspaceMetaFromYDoc,
  getWorkspaceUserAccessFromYDoc,
  getWorkspaceArtifactsFromYDoc,
  getWorkspaceThreadsFromYDoc,
  ImmediateDebouncer,
  type Manifest,
} from '@feynote/shared-utils';
import { getManifestDb, KVStoreKeys, ObjectStoreName } from './localDb';
import { waitFor } from '../waitFor';
import { appIdbStorageManager } from './AppIdbStorageManager';
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
 * How long an workspace can take to sync before we consider it timed out and kill it.
 */
const WORKSPACE_SYNC_TIMEOUT_MS = 10 * 1000;

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
const SYNC_BATCH_SIZE = 15;

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

    eventManager.addEventListener(EventName.WorkspaceUpdated, () => {
      if (ENABLE_VERBOSE_SYNC_LOGGING)
        console.log('Workspace updated, queueing sync');
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
      const artifactIdsNeedsSync = new Set<string>();

      {
        // Wrapped in a lexical context for memory optimization
        this._syncCheckAbort(signal);
        const localArtifactSnapshotKeys = new Set(
          await manifestDb.getAllKeys(ObjectStoreName.ArtifactSnapshots),
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
          artifactIdsNeedsSync.add(artifactId);
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
      if (artifactIdsNeedsSync.size) {
        // We instantiate a fresh websocket every time, since websockets get killed/closed
        // when left hanging without presence/awareness enabled
        const ws = new HocuspocusProviderWebsocket({
          url: getApiUrls().hocuspocus,
          delay: 50,
          minDelay: 50,
          maxDelay: 1000,
        });

        // We must operate in batches, because loading every single document in existence at the same time is dumb.
        const batches = [...artifactIdsNeedsSync].reduce((batches, id) => {
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
              return this.syncArtifact(artifactId, latestManifest, ws);
            }),
          );
          await waitFor(SYNC_BATCH_RATE_LIMIT_WAIT);
        }

        ws.destroy();
      }

      // ==== Update Workspaces ====
      const workspaceIdsNeedsSync = new Set<string>();

      {
        this._syncCheckAbort(signal);
        const localWorkspaceSnapshotKeys = new Set(
          await manifestDb.getAllKeys(ObjectStoreName.WorkspaceSnapshots),
        );
        const localWorkspaceVersionsRecords = await manifestDb.getAll(
          ObjectStoreName.WorkspaceVersions,
        );
        const localWorkspaceVersions: Record<string, number> = {};
        for (const record of localWorkspaceVersionsRecords) {
          localWorkspaceVersions[record.id] = record.version;
        }

        const workspaceSyncReasons: Record<string, SyncReason[]> = {};
        const addWorkspaceSyncReason = (
          workspaceId: string,
          syncReason: SyncReason,
        ) => {
          const syncedReasons = (workspaceSyncReasons[workspaceId] ||= []);
          syncedReasons.push(syncReason);
          workspaceIdsNeedsSync.add(workspaceId);
        };

        this._syncCheckAbort(signal);
        for (const workspaceId of Object.keys(
          latestManifest.workspaceVersions,
        )) {
          if (!localWorkspaceVersions[workspaceId]) {
            addWorkspaceSyncReason(
              workspaceId,
              SyncReason.VersionNotPresentInLocal,
            );
          } else if (
            localWorkspaceVersions[workspaceId] !==
            latestManifest.workspaceVersions[workspaceId]
          ) {
            addWorkspaceSyncReason(workspaceId, SyncReason.VersionNotMatch);
          }
          if (!localWorkspaceSnapshotKeys.has(workspaceId)) {
            addWorkspaceSyncReason(
              workspaceId,
              SyncReason.SnapshotNotPresentInLocal,
            );
          }
        }

        for (const workspaceId of Object.keys(localWorkspaceVersions)) {
          if (!latestManifest.workspaceVersions[workspaceId]) {
            addWorkspaceSyncReason(
              workspaceId,
              SyncReason.VersionNotPresentInRemote,
            );
          }
        }
        for (const workspaceId of localWorkspaceSnapshotKeys) {
          if (!latestManifest.workspaceVersions[workspaceId]) {
            addWorkspaceSyncReason(
              workspaceId,
              SyncReason.SnapshotNotPresentInRemote,
            );
          }
        }

        if (ENABLE_VERBOSE_SYNC_LOGGING) {
          for (const [id, reasons] of Object.entries(workspaceSyncReasons)) {
            const humanReasons = reasons
              .map((reason) => syncReasonHuman[reason])
              .join(',');
            console.log(`Syncing workspace ${id} because: ${humanReasons}`);
          }
        }
      }

      this._syncCheckAbort(signal);
      if (workspaceIdsNeedsSync.size) {
        const workspaceWs = new HocuspocusProviderWebsocket({
          url: getApiUrls().hocuspocus,
          delay: 50,
          minDelay: 50,
          maxDelay: 1000,
        });

        for (const workspaceId of workspaceIdsNeedsSync) {
          this._syncCheckAbort(signal);
          await this.syncWorkspace(workspaceId, latestManifest, workspaceWs);
        }

        workspaceWs.destroy();
      }

      await manifestDb.put(ObjectStoreName.KV, {
        key: KVStoreKeys.LastSyncedAt,
        value: new Date(),
      });
      eventManager.broadcast(EventName.LocaldbSyncCompleted);
      performance.mark('endSync');
      const measure = performance.measure('syncTime', 'startSync', 'endSync');
      console.log(
        `Syncing completed in ${measure.duration}ms. ${artifactIdsNeedsSync.size} artifacts, ${workspaceIdsNeedsSync.size} workspaces attempted.`,
      );
    } catch (e) {
      console.error('Sync failed', e);
      if (!(e instanceof AbortedSyncError)) {
        Sentry.captureException(e);
      }
    }
  }

  private async syncArtifact(
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
        console.log(
          `Deleting artifact ${artifactId} from IDB because it's not on the manifest`,
        );

      eventManager.broadcast(EventName.LocaldbArtifactSnapshotUpdated, {
        artifactId,
      });

      return;
    }

    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    await indexeddbProvider.whenSynced;

    if (snapshot?.createdLocally) {
      await trpc.artifact.createArtifact.mutate({
        yBin: encodeStateAsUpdate(doc),
      });
    }

    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: session.token,
      websocketProvider: ws,
      awareness: null,
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

    // This is required in Hocuspocus v3 when using a manually-managed websocket instance.
    // It wires up all of the internal event listeners.
    tiptapCollabProvider.attach();

    const cleanup = async () => {
      tiptapCollabProvider.destroy();
      await indexeddbProvider.destroy();
    };
    const result = await Promise.race([timeout, ttpSyncP]);

    if (result === false) {
      console.error(
        `Sync attempt for artifact ${artifactId} timed out after ${ARTIFACT_SYNC_TIMEOUT_MS / 1000} seconds!`,
      );
      await cleanup();
      return;
    }

    await this.searchManager.indexPartialArtifact(artifactId, doc, 'all');

    if (tiptapCollabProvider.authorizedScope) {
      await appIdbStorageManager.setAuthorizedCollaborationScope(
        docName,
        tiptapCollabProvider.authorizedScope,
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

    await cleanup();
  }

  private async syncWorkspace(
    workspaceId: string,
    manifest: Manifest,
    ws: HocuspocusProviderWebsocket,
  ): Promise<void> {
    const docName = `workspace:${workspaceId}`;
    console.log('Syncing', docName);
    const session = await appIdbStorageManager.getSession();
    if (!session) throw new Error('ERROR: Sync initiated without a token');

    const manifestDb = await getManifestDb();
    const snapshot = await manifestDb.get(
      ObjectStoreName.WorkspaceSnapshots,
      workspaceId,
    );

    if (
      !manifest.workspaceVersions[workspaceId] && // The manifest is the source of truth, since we require creations/deletions to happen synchronously without hocuspocus write-delay
      !snapshot?.createdLocally // Workspaces created locally will not exist on the manifest
    ) {
      await manifestDb.delete(ObjectStoreName.WorkspaceVersions, workspaceId);
      await manifestDb.delete(ObjectStoreName.WorkspaceSnapshots, workspaceId);
      try {
        await deleteDB(`workspace:${workspaceId}`);
      } catch (_e) {
        // Do nothing
      }
      if (ENABLE_VERBOSE_SYNC_LOGGING)
        console.log(
          `Deleting workspace ${workspaceId} from IDB because it's not on the manifest`,
        );

      eventManager.broadcast(EventName.LocaldbWorkspaceSnapshotUpdated, {
        workspaceId,
      });

      return;
    }

    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    await indexeddbProvider.whenSynced;

    if (snapshot?.createdLocally) {
      await trpc.workspace.createWorkspace.mutate({
        yBin: encodeStateAsUpdate(doc),
      });
    }

    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: session.token,
      websocketProvider: ws,
      awareness: null,
    });

    const ttpSyncP = new Promise<void>((resolve) => {
      tiptapCollabProvider.on('synced', () => {
        resolve();
      });
    });
    const timeout = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, WORKSPACE_SYNC_TIMEOUT_MS);
    });

    // This is required in Hocuspocus v3 when using a manually-managed websocket instance.
    // It wires up all of the internal event listeners.
    tiptapCollabProvider.attach();

    const cleanup = async () => {
      tiptapCollabProvider.destroy();
      await indexeddbProvider.destroy();
    };
    const result = await Promise.race([timeout, ttpSyncP]);

    if (result === false) {
      console.error(
        `Sync attempt for workspace ${workspaceId} timed out after ${WORKSPACE_SYNC_TIMEOUT_MS / 1000} seconds!`,
      );
      await cleanup();
      return;
    }

    if (tiptapCollabProvider.authorizedScope) {
      await appIdbStorageManager.setAuthorizedCollaborationScope(
        docName,
        tiptapCollabProvider.authorizedScope,
      );
    }

    const meta = getWorkspaceMetaFromYDoc(doc);
    const userAccessKV = getWorkspaceUserAccessFromYDoc(doc);
    const artifactsKV = getWorkspaceArtifactsFromYDoc(doc);
    const threadsKV = getWorkspaceThreadsFromYDoc(doc);

    if (!meta.id || !meta.userId) {
      console.error('Synced document is missing required fields');
      await cleanup();
      return;
    }

    await appIdbStorageManager.updateLocalWorkspaceSnapshot(
      workspaceId,
      {
        meta: {
          ...meta,
          id: meta.id, // This syntax is used to satisfy Typescript type narrowing from the check above
          userId: meta.userId,
        },
        userAccess: [...userAccessKV.yarray.toArray()],
        updatedAt: manifest.workspaceVersions[workspaceId] ?? Date.now(),
        artifactIds: [...artifactsKV.yarray.toArray()].map((el) => el.key),
        threadIds: [...threadsKV.yarray.toArray()].map((el) => el.key),
        createdLocally: false,
      },
      {
        create: true,
        createdLocally: false,
      },
    );

    await manifestDb.put(ObjectStoreName.WorkspaceVersions, {
      id: workspaceId,
      version: manifest.workspaceVersions[workspaceId],
    });

    await cleanup();
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
