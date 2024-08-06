import {
  HocuspocusProvider,
  HocuspocusProviderWebsocket,
} from '@hocuspocus/provider';
import { getApiUrls } from '../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc, decodeUpdate, type YEvent } from 'yjs';
import MiniSearch, {
  type Options,
  type Query,
  type SearchResult,
} from 'minisearch';
import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from 'idb';
import {
  ARTIFACT_META_KEY,
  ARTIFACT_TIPTAP_BODY_KEY,
  ArtifactTheme,
  ArtifactType,
  getJSONContentMapById,
  getMetaFromYArtifact,
  getReferencesFromJSONContent,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
} from '@feynote/shared-utils';
import { trpc } from '../../utils/trpc';
import { t } from 'i18next';
import { TRPCClientError } from '@trpc/client';

const ENABLE_VERBOSE_SYNC_LOGGING = true;
const ENABLE_VERBOSE_INDEX_LOGGING = true;

/**
 * Abitrary integers to represent important version numbers
 */
const SIGNIFICANT_VERSION_CODES = {
  CREATED_LOCALLY: -201000,
} as const;

const MANIFEST_SYNC_INTERVAL_MS = 60 * 1000;
const ARTIFACT_SYNC_TIMEOUT_MS = 5000;
/**
 * The amount of debounce time before saving the search index to disk.
 * Time re-extends by this amount every time a change is made to the index.
 */
const SEARCH_DB_SAVE_TIMEOUT_MS = 10 * 1000;
/**
 * The maximum allowable float time that the search index won't be saved to disk.
 * Effectively a cap for SEARCH_DB_SAVE_TIMEOUT_MS.
 */
const SEARCH_DB_SAVE_MAX_TIMEOUT_MS = 2 * 60 * 1000;
/**
 * How many artifacts to sync at once
 */
const SYNC_BATCH_SIZE = 5;

const getTiptapIdsFromYEvent = (yEvent: YEvent<any>) => {
  // Yjs change target is simple, but we do recurse up the tree here to cover all nodes changed
  const getIdsFromChangeTarget = (node: any): string[] => {
    const ids: string[] = [];

    if (node.getAttribute?.('id')) {
      ids.push(node.getAttribute?.('id'));
    }

    if (node.parent) ids.push(...getIdsFromChangeTarget(node.parent));

    return ids;
  };

  // From yjs delta format, we grab all ids up the tree stored as attributes by tiptap
  const getIdsFromDelta = (delta: any): string[] => {
    const ids: string[] = [];

    if (!delta.content) return ids;

    const yContents = delta.content?.getContent();
    if (!yContents) return ids;

    for (const content of yContents) {
      ids.push(content._map?.get('id')?.content.getContent()[0]);

      if (content.parent) ids.push(...getIdsFromDelta(content.parent));
    }

    return ids;
  };

  // I don't completely understand why, but sometimes when
  // tiptap updates the ID for an existing node to a different ID,
  // the id gets put in this yEvent keys map
  const directId = yEvent.changes.keys.get('id')?.oldValue;

  // Delta captures any added or removed nodes
  const deltaAddRemoveIds = [...yEvent.changes.added, ...yEvent.changes.deleted]
    .map(getIdsFromDelta)
    .flat();

  // The change target must be used to cover when edits inside of a node are made, since
  // delta records only relative positions of edits
  const changeTargetIds = getIdsFromChangeTarget(yEvent.target);

  return [directId, ...changeTargetIds, ...deltaAddRemoveIds];
};

interface YConnection {
  doc: Doc;
  tiptapCollabProvider: HocuspocusProvider;
  tiptapCollabProviderSynced: boolean;
  indexeddbProvider: IndexeddbPersistence;
  indexeddbProviderSynced: boolean;
}

class ConnectionTrackingManager {
  private openConnectionIds = new Set<string>();

  open(id: string) {
    this.openConnectionIds.add(id);
  }

  close(id: string) {
    this.openConnectionIds.delete(id);
  }

  isOpen(id: string) {
    return this.openConnectionIds.has(id);
  }
}

export const SearchWildcard: typeof MiniSearch.wildcard = MiniSearch.wildcard;

class SyncManager {
  private syncing = false;
  private syncInterval: NodeJS.Timeout;

  constructor(
    private manifestDb: IDBPDatabase,
    private searchManager: SearchManager,
    private connectionTrackingManager: ConnectionTrackingManager,
    private token: string,
  ) {
    this.syncManifest();

    this.syncInterval = setInterval(() => {
      this.syncManifest();
    }, MANIFEST_SYNC_INTERVAL_MS);
  }

  getDocName(artifactId: string): string {
    return `artifact:${artifactId}`;
  }

  private async syncManifest(): Promise<void> {
    if (this.syncing) {
      console.log('Sync already in progress');
      return;
    }

    performance.mark('startSync');

    console.log('Syncing!');
    this.syncing = true;

    await this.searchManager.onReady();

    try {
      const latestManifest = await trpc.user.syncManifest.query();

      // ==== Update Artifact References ====
      const localEdges = await this.manifestDb.getAll('edges');
      console.log('sync localEdges', localEdges, latestManifest.edges);
      const localEdgeIds = new Set(localEdges.map((edge) => edge.id));
      const remoteEdgeIds = new Set(
        latestManifest.edges.map(
          (edge) =>
            `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactId}:${edge.targetArtifactBlockId}`,
        ),
      );

      for (const edge of latestManifest.edges) {
        const edgeId = `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactId}:${edge.targetArtifactBlockId}`;
        if (localEdgeIds.has(edgeId)) {
          await this.manifestDb.put('edges', {
            ...edge,
            targetArtifactBlockId: edge.targetArtifactBlockId || '',
            id: edgeId,
          });
        } else {
          await this.manifestDb.add('edges', {
            ...edge,
            targetArtifactBlockId: edge.targetArtifactBlockId || '',
            id: edgeId,
          });
        }
      }

      for (const edgeId of localEdgeIds) {
        if (!remoteEdgeIds.has(edgeId)) {
          await this.manifestDb.delete('edges', edgeId);
        }
      }

      // ==== Update Artifacts ====
      const localArtifactVersionsRecords =
        await this.manifestDb.getAll('artifactVersions');
      const localArtifactVersions: Record<string, number> = {};
      for (const record of localArtifactVersionsRecords) {
        localArtifactVersions[record.artifactId] = record.version;
      }

      const needsSync = new Set<string>();

      for (const [artifactId, version] of Object.entries(
        latestManifest.artifactVersions,
      )) {
        if (!localArtifactVersions[artifactId]) {
          // Exists on server, but does not exist on client
          await this.manifestDb.add('artifactVersions', {
            artifactId,
            version,
          });
          needsSync.add(artifactId);
          if (ENABLE_VERBOSE_SYNC_LOGGING)
            console.log(
              `Adding ${artifactId} to sync queue because it's not present locally`,
            );
        } else if (localArtifactVersions[artifactId] !== version) {
          // Exists on server, but versions do not match
          await this.manifestDb.put('artifactVersions', {
            artifactId,
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
        if (
          !latestManifest.artifactVersions[artifactId] &&
          localArtifactVersions[artifactId] !==
            SIGNIFICANT_VERSION_CODES.CREATED_LOCALLY
        ) {
          // Exists in local search index but not on server, and is not waiting to be created on the server
          await this.searchManager.unindexArtifact(artifactId);
          if (ENABLE_VERBOSE_SYNC_LOGGING)
            console.log(
              `Deindexing ${artifactId} because it's not on the manifest`,
            );
        }
      }

      for (const [artifactId, version] of Object.entries(
        localArtifactVersions,
      )) {
        if (!latestManifest.artifactVersions[artifactId]) {
          // Exists on client, but does not exist on server

          // If artifact was not created locally & therefore awaiting a sync, we can nuke it locally
          if (version !== SIGNIFICANT_VERSION_CODES.CREATED_LOCALLY) {
            // TODO: we should probably clean up any open connections and potentially idb storage of y artifact
            await this.manifestDb.delete('artifactVersions', artifactId);
            await this.searchManager.unindexArtifact(artifactId);
            if (ENABLE_VERBOSE_SYNC_LOGGING)
              console.log(
                `Deleting ${artifactId} because it's not on the manifest`,
              );
            return;
          }

          try {
            if (ENABLE_VERBOSE_SYNC_LOGGING)
              console.log(
                `Creating ${artifactId} because it's marked as created locally`,
              );
            await trpc.artifact.createArtifact.mutate({
              id: artifactId,
            });
            // We mark the artifact as no longer "created locally" and therefore synced
            await this.manifestDb.put('artifactVersions', {
              artifactId,
              version: 1,
            });
            needsSync.add(artifactId);
          } catch (e) {
            if (ENABLE_VERBOSE_SYNC_LOGGING)
              console.log(`Failed to create ${artifactId} on the server`);
            // TODO: report to sentry
            if (e instanceof TRPCClientError) {
              const statusCode = e.data?.httpStatus || 500;
              if (statusCode === 409) {
                // Mr. Stark I don't feel so good...
                alert('critical sync error');
                // await this.manifestDb.delete("artifactVersions", artifactId);
              }
            }

            throw e;
          }
        }
      }

      for (const id of needsSync) {
        if (this.connectionTrackingManager.isOpen(this.getDocName(id)))
          needsSync.delete(id);
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

    this.syncing = false;
  }

  private async sync(
    artifactId: string,
    ws: HocuspocusProviderWebsocket,
  ): Promise<(() => Promise<void>) | undefined> {
    const docName = this.getDocName(artifactId);
    if (this.connectionTrackingManager.isOpen(docName)) return;
    console.log('Syncing', docName);
    this.connectionTrackingManager.open(docName);
    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: this.token,
      websocketProvider: ws,
      preserveConnection: false,
      awareness: null,
    });

    const metaObserveListener = async () => {
      await this.searchManager.indexPartialArtifact(artifactId, doc, []);
    };

    const docObserveListener = async (yEvents: YEvent<any>[]) => {
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

    if (result === false) {
      console.error(
        `Sync attempt for ${artifactId} timed out after ${ARTIFACT_SYNC_TIMEOUT_MS / 1000} seconds!`,
      );
    }

    return async () => {
      doc
        .getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY)
        .unobserveDeep(docObserveListener);
      doc.getMap(ARTIFACT_META_KEY).unobserveDeep(metaObserveListener);
      tiptapCollabProvider.destroy();
      await indexeddbProvider.destroy();
      this.connectionTrackingManager.close(docName);
    };
  }

  async incrementLocalArtifactVersion(artifactId: string): Promise<void> {
    const record = await this.manifestDb.get('artifactVersions', artifactId);
    if (record && record.version > 0) {
      await this.manifestDb.put('artifactVersions', {
        artifactId,
        version: record.version + 1,
      });
    }
  }

  async destroy(): Promise<void> {
    clearInterval(this.syncInterval);
  }
}

class SearchManager {
  private miniSearch: MiniSearch;
  private knownBlockIdsByArtifactId = new Map<
    string,
    Set<string | undefined>
  >();
  private miniSearchOptions = {
    fields: ['text'],
    storeFields: ['artifactId', 'blockId', 'artifactTitle', 'previewText'],
  } satisfies Options;
  private initPromise = this.populateFromLocalDb();
  private saveTimeout: NodeJS.Timeout | undefined;
  private maxSaveTimeout: NodeJS.Timeout | undefined;

  constructor(private manifestDb: IDBPDatabase) {
    this.miniSearch = new MiniSearch(this.miniSearchOptions);
  }

  search(text: Query): SearchResult[] {
    return Array.from(
      this.miniSearch.search(text, {
        prefix: true,
      }),
    );
  }

  async populateFromLocalDb() {
    performance.mark('startIndexLoad');

    const indexRecord = await this.manifestDb.get('searchIndex', 'index');

    if (!indexRecord) return;

    try {
      // TODO: This takes a while in Chrome, but
      this.miniSearch = await MiniSearch.loadJSONAsync(
        indexRecord.value,
        this.miniSearchOptions,
      );

      this.repopulateKnownIds();
    } catch (e) {
      console.error('Failed to load MiniSearch index from local DB', e);
    }

    performance.mark('endIndexLoad');
    const measure = performance.measure(
      'indexLoadTime',
      'startIndexLoad',
      'endIndexLoad',
    );
    console.log(
      `Loading index took ${measure.duration}ms. ${this.knownBlockIdsByArtifactId.size} artifacts loaded.`,
    );
  }

  repopulateKnownIds() {
    const storedFields = this.getStoredFields();

    this.knownBlockIdsByArtifactId = new Map();
    for (const storedField of storedFields) {
      const existing = this.knownBlockIdsByArtifactId.get(
        storedField.artifactId,
      );
      if (existing) existing.add(storedField.blockId);
      else
        this.knownBlockIdsByArtifactId.set(
          storedField.artifactId,
          new Set([storedField.blockId]),
        );
    }
  }

  getIndexId(artifactId: string, artifactBlockId: string | undefined): string {
    if (artifactBlockId) {
      return `${artifactId}:${artifactBlockId}`;
    }

    return artifactId;
  }

  /**
   * Helps get around the fact that _storedFields is a protected property
   * and we don't want to have a ts-expect-error floating everywhere
   */
  private getStoredFields(): IterableIterator<{
    artifactId: string;
    blockId: string | undefined;
    previewText: string;
    artifactTitle: string | undefined;
  }> {
    // @ts-expect-error _storedFields is a protected property
    return this.miniSearch._storedFields.values();
  }

  onReady(): Promise<void> {
    return this.initPromise;
  }

  getKnownIndexIds(): ReadonlyMap<string, ReadonlySet<string | undefined>> {
    return this.knownBlockIdsByArtifactId;
  }

  getKnownIdsForArtifact(
    artifactId: string,
  ): ReadonlySet<string | undefined> | undefined {
    return this.knownBlockIdsByArtifactId.get(artifactId);
  }

  async unindexArtifact(artifactId: string): Promise<void> {
    await this.initPromise;

    const blockIds = this.knownBlockIdsByArtifactId.get(artifactId);
    if (!blockIds) return;

    const indexIds = [...blockIds].map((blockId) =>
      this.getIndexId(artifactId, blockId),
    );
    this.miniSearch.discardAll(indexIds);
    this.knownBlockIdsByArtifactId.delete(artifactId);

    this.scheduleSave();
  }

  /**
   * Indexes the artifact title. Indexes/deindexes blockIds passed accordingly.
   * Passed blockIds can be blockIds that have been added or removed.
   *
   * Note: Still not particularly efficient, so reduce calls where possible
   * Avoid using "all" for blockIds if possible, since it must cause a full re-index for that artifact
   */
  async indexPartialArtifact(
    artifactId: string,
    doc: Doc,
    blockIds: string[] | 'all',
  ): Promise<void> {
    await this.initPromise;

    const artifactJsonContent = getTiptapContentFromYjsDoc(
      doc,
      ARTIFACT_TIPTAP_BODY_KEY,
    );
    const jsonContentById = getJSONContentMapById(artifactJsonContent);

    if (blockIds === 'all') {
      // We have to unindex because we don't know what _doesn't_ exist in the artifact
      await this.unindexArtifact(artifactId);
      blockIds = Object.keys(jsonContentById);
    }

    const artifactMeta = getMetaFromYArtifact(doc);
    const artifactIndexId = this.getIndexId(artifactId, undefined);
    if (!this.knownBlockIdsByArtifactId.has(artifactId)) {
      this.knownBlockIdsByArtifactId.set(artifactId, new Set());
    }
    const knownBlockIds = this.knownBlockIdsByArtifactId.get(artifactId)!;

    if (artifactMeta.title) {
      const artifactIndexDoc = {
        id: artifactIndexId,
        artifactId,
        text: artifactMeta.title,
        artifactTitle: artifactMeta.title,
        previewText: artifactMeta.title,
      };
      if (this.miniSearch.has(artifactIndexId)) {
        this.miniSearch.replace(artifactIndexDoc);
      } else {
        this.miniSearch.add(artifactIndexDoc);
      }
      knownBlockIds.add(undefined);
    } else {
      if (this.miniSearch.has(artifactIndexId)) {
        this.miniSearch.discard(artifactIndexId);
      }
      knownBlockIds.delete(undefined);
    }

    for (const blockId of jsonContentById.keys()) {
      if (!this.miniSearch.has(this.getIndexId(artifactId, blockId))) {
        blockIds.push(blockId);
      }
    }
    for (const blockId of knownBlockIds) {
      if (blockId && !jsonContentById.has(blockId)) {
        blockIds.push(blockId);
      }
    }

    if (ENABLE_VERBOSE_INDEX_LOGGING)
      console.log(
        `Updating search index for ${artifactId}, ${blockIds.length} blocks to update`,
      );

    for (const blockId of blockIds) {
      const blockIndexId = this.getIndexId(artifactId, blockId);
      const jsonContent = jsonContentById.get(blockId);
      if (jsonContent) {
        // Block has been added/updated, so we update index accordingly
        const blockText = getTextForJSONContent(jsonContent);
        const artifactBlockIndexDoc = {
          id: blockIndexId,
          artifactId,
          blockId,
          text: blockText,
          artifactTitle: artifactMeta.title,
          previewText: blockText.substring(0, 100),
        };
        if (this.miniSearch.has(blockIndexId)) {
          this.miniSearch.replace(artifactBlockIndexDoc);
        } else {
          this.miniSearch.add(artifactBlockIndexDoc);
        }
        this.knownBlockIdsByArtifactId.get(artifactId)?.add(blockId);
      } else {
        // Block has been removed from doc, so we remove it from index
        if (this.miniSearch.has(blockIndexId)) {
          this.miniSearch.discard(blockIndexId);
        }
        this.knownBlockIdsByArtifactId.get(artifactId)?.delete(blockId);
      }
    }

    this.scheduleSave();
  }

  scheduleSave() {
    clearTimeout(this.saveTimeout);

    this.saveTimeout = setTimeout(() => {
      this.saveToLocalDB();
    }, SEARCH_DB_SAVE_TIMEOUT_MS);

    if (!this.maxSaveTimeout) {
      this.maxSaveTimeout = setTimeout(() => {
        this.saveToLocalDB();
      }, SEARCH_DB_SAVE_MAX_TIMEOUT_MS);
    }
  }

  async saveToLocalDB(): Promise<void> {
    clearTimeout(this.saveTimeout);
    clearTimeout(this.maxSaveTimeout);

    if (await this.manifestDb.get('searchIndex', 'index')) {
      await this.manifestDb.put('searchIndex', {
        id: 'index',
        value: JSON.stringify(this.miniSearch),
      });
    } else {
      await this.manifestDb.add('searchIndex', {
        id: 'index',
        value: JSON.stringify(this.miniSearch),
      });
    }
  }

  async destroy(): Promise<void> {
    await this.saveToLocalDB();
    clearTimeout(this.saveTimeout);
    clearTimeout(this.maxSaveTimeout);
  }
}

interface EdgeIdentifier {
  artifactId: string;
  artifactBlockId: string;
  targetArtifactId: string;
  targetArtifactBlockId: string | undefined;
}

interface Edge extends EdgeIdentifier {
  referenceText: string;
}

class EdgeManager {
  constructor(private manifestDb: IDBPDatabase) {}

  getEdgeId(edge: {
    artifactId: string;
    artifactBlockId: string;
    targetArtifactId: string;
    targetArtifactBlockId: string | undefined;
  }): string {
    return `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactId}:${edge.targetArtifactBlockId}`;
  }

  async getEdge(identifier: EdgeIdentifier): Promise<Edge | undefined> {
    const edgeId = this.getEdgeId(identifier);

    const edge = await this.manifestDb.get('edges', edgeId);

    return edge;
  }

  async getOutgoingEdges(artifactId: string): Promise<Edge[]> {
    const edges = await this.manifestDb.getAllFromIndex(
      'edges',
      'artifactId',
      artifactId,
    );
    console.log('getting', edges);

    return edges;
  }

  async upsertEdge(edge: Edge): Promise<void> {
    const id = this.getEdgeId(edge);

    if (await this.manifestDb.get('edges', id)) {
      await this.manifestDb.put('edges', edge, id);
    } else {
      await this.manifestDb.add('edges', edge, id);
    }
  }

  async deleteEdge(edge: EdgeIdentifier): Promise<void> {
    const id = this.getEdgeId(edge);
    await this.manifestDb.delete('edges', id);
  }

  async updateEdgesReferenceText(
    targetArtifactId: string,
    targetArtifactBlockId: string | undefined,
    referenceText: string,
  ): Promise<void> {
    let edges;
    if (targetArtifactBlockId) {
      edges = await this.manifestDb.getAllFromIndex(
        'edges',
        'targetArtifactId, targetArtifactBlockId',
        [targetArtifactId, targetArtifactBlockId],
      );
    } else {
      edges = await this.manifestDb.getAllFromIndex(
        'edges',
        'targetArtifactId',
        [targetArtifactId],
      );
    }

    for (const edge of edges) {
      const id = this.getEdgeId(edge);
      const updatedEdge = {
        ...edge,
        referenceText,
      };

      await this.manifestDb.put('edges', updatedEdge, id);
    }
  }

  async updateEdgesForYDoc(
    artifactId: string,
    doc: Doc,
    updatedBlockIds: string[],
  ): Promise<void> {
    const artifactJsonContent = getTiptapContentFromYjsDoc(
      doc,
      ARTIFACT_TIPTAP_BODY_KEY,
    );
    const jsonContentById = getJSONContentMapById(artifactJsonContent);

    // ==== Update Incoming References ====
    const artifactMeta = getMetaFromYArtifact(doc);
    await this.updateEdgesReferenceText(
      artifactId,
      undefined,
      artifactMeta.title,
    );

    for (const updatedBlockId of updatedBlockIds) {
      const jsonContent = jsonContentById.get(updatedBlockId);
      // TODO: likely need to mark broken reference if this is true
      if (!jsonContent) continue;

      const text = getTextForJSONContent(jsonContent);

      await this.updateEdgesReferenceText(artifactId, updatedBlockId, text);
    }

    // TODO: We currently don't update outgoing references locally, and instead
    // depend on the server to do so.
    // ==== Update Outgoing References ====
    // const outgoingReferences = getReferencesFromJSONContent(artifactJsonContent);
    // for (const outgoingReference of outgoingReferences) {
    // }
  }
}

export class YManager {
  private ws: HocuspocusProviderWebsocket;
  private connectionTrackingManager = new ConnectionTrackingManager();
  private searchManager: SearchManager;
  private syncManager: SyncManager;
  private edgeManager: EdgeManager;

  private openArtifacts: {
    artifactId: string;
    connection: YConnection;
  }[] = [];

  private cleanupOps: (() => void)[] = [];

  constructor(
    private userId: string,
    private token: string,
    private manifestDb: IDBPDatabase,
    onReady: () => void,
  ) {
    this.ws = new HocuspocusProviderWebsocket({
      url: getApiUrls().hocuspocus,
      delay: 1000,
      minDelay: 1000,
      maxDelay: 30000,
    });

    this.searchManager = new SearchManager(this.manifestDb);
    this.syncManager = new SyncManager(
      this.manifestDb,
      this.searchManager,
      this.connectionTrackingManager,
      this.token,
    );
    this.edgeManager = new EdgeManager(this.manifestDb);

    // TODO: evaluate whether we want to signal readiness later (once search index initialized?)
    setTimeout(() => onReady());
  }

  connectArtifact(artifactId: string): YConnection {
    const docName = `artifact:${artifactId}`;
    this.connectionTrackingManager.open(docName);
    const existingConnection = this.openArtifacts.find(
      (openArtifact) => openArtifact.artifactId === artifactId,
    );
    if (existingConnection) {
      return existingConnection.connection;
    }

    const newConnection = {
      artifactId,
      connection: this.createConnection(docName),
    };

    newConnection.connection.doc
      .getMap(ARTIFACT_META_KEY)
      .observeDeep(async () => {
        await this.searchManager.indexPartialArtifact(
          artifactId,
          newConnection.connection.doc,
          [],
        );
        await this.syncManager.incrementLocalArtifactVersion(artifactId);
      });

    newConnection.connection.doc
      .getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY)
      .observeDeep(async (yEvents) => {
        const changedIds = yEvents.map(getTiptapIdsFromYEvent).flat();

        await this.searchManager.indexPartialArtifact(
          artifactId,
          newConnection.connection.doc,
          changedIds,
        );
        await this.syncManager.incrementLocalArtifactVersion(artifactId);
      });

    this.openArtifacts.push(newConnection);

    return newConnection.connection;
  }

  private createConnection(docName: string): YConnection {
    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    this.cleanupOps.push(() => indexeddbProvider.destroy());
    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: this.token,
      preserveConnection: true,
      websocketProvider: this.ws,
    });
    this.cleanupOps.push(() => tiptapCollabProvider.destroy());

    const connection = {
      doc,
      tiptapCollabProvider,
      tiptapCollabProviderSynced: false,
      indexeddbProvider,
      indexeddbProviderSynced: false,
    } as YConnection;

    const idbSyncListener = () => {
      connection.indexeddbProviderSynced = true;
    };
    indexeddbProvider.on('sync', idbSyncListener);

    const wsSyncListener = () => {
      connection.tiptapCollabProviderSynced = true;
    };
    tiptapCollabProvider.on('sync', wsSyncListener);

    return connection;
  }

  async isArtifactOnManifest(artifactId: string): Promise<boolean> {
    const entry = await this.manifestDb.getFromIndex(
      'artifactVersions',
      'artifactId',
      artifactId,
    );

    return !!entry;
  }

  async createArtifact(params: {
    title: string;
    type: ArtifactType;
    theme: ArtifactTheme;
  }): Promise<string> {
    const id = crypto.randomUUID();

    const conn = this.connectArtifact(id);
    const yMeta = conn.doc.getMap(ARTIFACT_META_KEY);
    yMeta.set('title', params.title);
    yMeta.set('type', params.type);
    yMeta.set('theme', params.theme);

    this.manifestDb.add('artifactVersions', {
      artifactId: id,
      version: SIGNIFICANT_VERSION_CODES.CREATED_LOCALLY,
    });

    return id;
  }

  async destroy(): Promise<void> {
    await Promise.all(this.cleanupOps.map((op) => op()));
    await this.syncManager.destroy();
    await this.searchManager.destroy();
    this.ws.destroy();
  }

  /**
   * This method is labelled as async so that we have the potential for async behaviors later
   */
  async search(text: Query): Promise<SearchResult[]> {
    return this.searchManager.search(text);
  }

  /**
   * Gets all edges from this artifactId pointing outwards to other artifacts
   */
  async getOutgoingEdges(artifactId: string): Promise<Edge[]> {
    return this.edgeManager.getOutgoingEdges(artifactId);
  }

  // TODO: we don't currently disconnect from artifacts... ever. We probably want to reconsider that.
  // async disconnect(openArtifact: typeof this.openArtifacts[0]) {
  //   const idx = this.openArtifacts.indexOf(openArtifact);
  //
  //   if (idx > -1) {
  //     const artifact = this.openArtifacts[idx];
  //     this.openArtifacts.splice(idx, 1);
  //     await artifact.indexeddbProvider.destroy();
  //   }
  // }
  //
  // async disconnectAll() {
  //   for (const connection of this.openArtifacts) {
  //     await connection.indexeddbProvider.destroy();
  //   }
  //
  //   this.openArtifacts.splice(0);
  // }
}
