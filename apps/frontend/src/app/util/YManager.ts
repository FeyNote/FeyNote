import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { getApiUrls } from '../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc, decodeUpdate, type YEvent } from 'yjs';
import MiniSearch, { type Options, type Query, type SearchResult } from 'minisearch';
import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from 'idb';
import { ARTIFACT_META_KEY, ARTIFACT_TIPTAP_BODY_KEY, ArtifactTheme, ArtifactType, getJSONContentMapById, getMetaFromYArtifact, getReferencesFromJSONContent, getTextForJSONContent, getTiptapContentFromYjsDoc } from '@feynote/shared-utils';
import { trpc } from '../../utils/trpc';
import { t } from 'i18next';
import { TRPCClientError } from '@trpc/client';

/**
  * Abitrary integers to represent important version numbers
  */
const SIGNIFICANT_VERSION_CODES = {
  CREATED_LOCALLY: -201000,
} as const;

const MANIFEST_SYNC_INTERVAL = 10000;
const ARTIFACT_SYNC_TIMEOUT = 5000;

const getTiptapIdsFromYEvent = (yEvent: YEvent<any>) => {
  // Yjs change target is simple, but we do recurse up the tree here to cover all nodes changed
  const getIdsFromChangeTarget = (node: any): string[] => {
    const ids: string[] = [];

    if (node.getAttribute?.("id")) {
      ids.push(node.getAttribute?.("id"));
    }

    if (node.parent) ids.push(...getIdsFromChangeTarget(node.parent));

    return ids;
  }

  // From yjs delta format, we grab all ids up the tree stored as attributes by tiptap
  const getIdsFromDelta = (delta: any): string[] => {
    const ids: string[] = [];

    if (!delta.content) return ids;

    for (const content of delta.content?.getContent()) {
      ids.push(content._map?.get("id")?.content.getContent()[0]);

      if (content.parent) ids.push(...getIdsFromDelta(content.parent));
    }

    return ids;
  }

  // I don't completely understand why, but sometimes when
  // tiptap updates the ID for an existing node to a different ID,
  // the id gets put in this yEvent keys map
  const directId = yEvent.changes.keys.get("id")?.oldValue;

  // Delta captures any added or removed nodes
  const deltaAddRemoveIds = [...yEvent.changes.added, ...yEvent.changes.deleted].map(getIdsFromDelta).flat();

  // The change target must be used to cover when edits inside of a node are made, since
  // delta records only relative positions of edits
  const changeTargetIds = getIdsFromChangeTarget(yEvent.target);

  return [directId, ...changeTargetIds, ...deltaAddRemoveIds];
}

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
  private syncing: boolean = false;
  private syncInterval: NodeJS.Timeout;
  private ws: HocuspocusProviderWebsocket;

  constructor(
    private ws2: HocuspocusProviderWebsocket,
    private manifestDb: IDBPDatabase,
    private searchManager: SearchManager,
    private connectionTrackingManager: ConnectionTrackingManager,
    private token: string,
  ) {
    this.ws = new HocuspocusProviderWebsocket({
      url: getApiUrls().hocuspocus,
      delay: 1000,
      minDelay: 1000,
      maxDelay: 30000,
    });

    this.syncManifest();

    this.syncInterval = setInterval(() => {
      this.syncManifest();
    }, MANIFEST_SYNC_INTERVAL);
  }

  getDocName(artifactId: string): string {
    return `artifact:${artifactId}`;
  }

  private async syncManifest(): Promise<void> {
    if (this.syncing) {
      console.log("Sync already in progress");
      return;
    }

    performance.mark("startSync");

    console.log("Syncing!");
    this.syncing = true;

    await this.ws.connect();

    try {
      const latestManifest = await trpc.user.syncManifest.query();

      // ==== Update Artifact References ====
      const localEdges = await this.manifestDb.getAll("edges");
      console.log("sync localEdges", localEdges, latestManifest.edges);
      const localEdgeIds = new Set(localEdges.map((edge) => edge.id));
      const remoteEdgeIds = new Set(latestManifest.edges.map((edge) => `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactId}:${edge.targetArtifactBlockId}`));

      for (const edge of latestManifest.edges) {
        const edgeId = `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactId}:${edge.targetArtifactBlockId}`;
        if (localEdgeIds.has(edgeId)) {
          await this.manifestDb.put("edges", {
            ...edge,
            targetArtifactBlockId: edge.targetArtifactBlockId || "",
            id: edgeId
          });
        } else {
          await this.manifestDb.add("edges", {
            ...edge,
            targetArtifactBlockId: edge.targetArtifactBlockId || "",
            id: edgeId
          });
        }
      }

      for (const edgeId of localEdgeIds) {
        if (!remoteEdgeIds.has(edgeId)) {
          await this.manifestDb.delete("edges", edgeId);
        }
      }

      // ==== Update Artifacts ====
      const localArtifactVersionsRecords = await this.manifestDb.getAll("artifactVersions");
      const localArtifactVersions: Record<string, number> = {};
      for (const record of localArtifactVersionsRecords) {
        localArtifactVersions[record.artifactId] = record.version;
      }

      const needsSync = new Set<string>();

      for (const [artifactId, version] of Object.entries(latestManifest.artifactVersions)) {
        if (!localArtifactVersions[artifactId]) {
          // Exists on server, but does not exist on client
          await this.manifestDb.add("artifactVersions", {
            artifactId,
            version
          });
          needsSync.add(artifactId);
        } else if (localArtifactVersions[artifactId] !== version) {
          // Exists on server, but versions do not match
          await this.manifestDb.put("artifactVersions", {
            artifactId,
            version,
          });
          needsSync.add(artifactId);
        }
      }

      const searchIndexKnownArtifactIds = this.searchManager.getKnownArtifactIds();
      for (const [artifactId] of Object.entries(latestManifest.artifactVersions)) {
        if (!searchIndexKnownArtifactIds.has(artifactId)) {
          // Exists on server but not in local search index
          needsSync.add(artifactId);
        }
      }
      for (const artifactId of searchIndexKnownArtifactIds) {
        if (!latestManifest.artifactVersions[artifactId] && localArtifactVersions[artifactId] !== SIGNIFICANT_VERSION_CODES.CREATED_LOCALLY) {
          // Exists in local search index but not on server, and is not waiting to be created on the server
          this.searchManager.unindexArtifact(artifactId);
        }
      }

      for (const [artifactId, version] of Object.entries(localArtifactVersions)) {
        if (!latestManifest.artifactVersions[artifactId]) {
          // Exists on client, but does not exist on server

          // If artifact was not created locally & therefore awaiting a sync, we can nuke it locally
          if (version !== SIGNIFICANT_VERSION_CODES.CREATED_LOCALLY) {
            // TODO: we should probably clean up any open connections and potentially idb storage of y artifact
            await this.manifestDb.delete("artifactVersions", artifactId);
            this.searchManager.unindexArtifact(artifactId);
            return;
          }

          try {
            await trpc.artifact.createArtifact.mutate({
              id: artifactId,
            });
            // We mark the artifact as no longer "created locally" and therefore synced
            await this.manifestDb.put("artifactVersions", {
              artifactId,
              version: 1,
            });
            needsSync.add(artifactId);
          } catch(e) {
            // TODO: report to sentry
            if (e instanceof TRPCClientError) {
              const statusCode = e.data?.httpStatus || 500;
              if (statusCode === 409) {
                // Mr. Stark I don't feel so good...
                alert("critical sync error");
                // await this.manifestDb.delete("artifactVersions", artifactId);
              }
            }

            throw e;
          }
        }
      }

      const cleanupFns = await Promise.all(
        [...needsSync].map((artifactId) => {
          return this.sync(artifactId);
        })
      );

      await Promise.all(cleanupFns.map((cleanupFn) => cleanupFn?.()));

      performance.mark("endSync");
      const measure = performance.measure(
        "syncTime",
        "startSync",
        "endSync"
      );
      console.log(`Syncing complete. ${needsSync.size} items updated in ${measure.duration}ms.`);
    } catch(e) {
      console.error("Sync failed", e);
    }

    this.syncing = false;
  }

  private async sync(artifactId: string): Promise<(() => Promise<void>) | undefined> {
    const docName = this.getDocName(artifactId);
    if (this.connectionTrackingManager.isOpen(docName)) return;
    console.log("Syncing", docName);
    this.connectionTrackingManager.open(docName);
    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: this.token,
      websocketProvider: this.ws,
      preserveConnection: true,
      awareness: null,
    });

    const observeListener = async (yEvents: YEvent<any>[]) => {
      const changedIds = yEvents.map(getTiptapIdsFromYEvent).flat();

      if (!this.searchManager.hasArtifact(artifactId)) {
        this.searchManager.indexPartialArtifact(artifactId, doc, "all");
      } else {
        this.searchManager.indexPartialArtifact(artifactId, doc, changedIds);
      }
    };
    // TODO: this observeDeep call likely picks up every single applied change even from our own IndexeddbPersistence provider
    // not just incoming changes from the HocuspocusProvider
    doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY).observeDeep(observeListener);

    const idbSyncP = new Promise<void>((resolve) => {
      indexeddbProvider.on("synced", () => {
        console.log("idbSync");
        resolve();
      });
    });
    const ttpSyncP = new Promise<void>((resolve) => {
      tiptapCollabProvider.on("synced", () => {
        console.log("ttpSync");
        resolve();
      });
    });
    const timeout = new Promise<boolean>((resolve) => {
      setTimeout(() => {
        resolve(false);
      }, ARTIFACT_SYNC_TIMEOUT);
    });

    const result = await Promise.race([
      timeout,
      Promise.all([idbSyncP, ttpSyncP])
    ]);

    if (result === false) {
      console.error(`Sync for ${artifactId} timed out after ${ARTIFACT_SYNC_TIMEOUT / 1000} seconds!`);
    }

    return async () => {
      doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY).unobserveDeep(observeListener);
      tiptapCollabProvider.destroy();
      await indexeddbProvider.destroy();
      this.connectionTrackingManager.close(docName);
    }
  }

  async incrementLocalArtifactVersion(artifactId: string): Promise<void> {
    const record = await this.manifestDb.get("artifactVersions", artifactId);
    if (record && record.version > 0) {
      await this.manifestDb.put("artifactVersions", {
        artifactId,
        version: record.version + 1,
      });
    }
  }

  async destroy(): Promise<void> {
    clearInterval(this.syncInterval);
    this.ws.destroy();
  }
}

class SearchManager {
  private miniSearch: MiniSearch;
  private knownArtifactIds = new Set<string>();

  constructor(private userId: string) {
    const miniSearchOptions = {
      fields: ["text"],
      storeFields: ["artifactId", "blockId", "artifactTitle", "previewText"],
    } satisfies Options;

    const indexUserId = localStorage.getItem("miniSearch-userId");
    if (indexUserId !== userId) {
      localStorage.removeItem("miniSearch-index");
      localStorage.setItem("miniSearch-userId", userId);
    }

    // TODO: True-up with server on interval
    const index = localStorage.getItem("miniSearch-index");
    if (index) {
      this.miniSearch = MiniSearch.loadJSON(index, miniSearchOptions);
    } else {
      this.miniSearch = new MiniSearch(miniSearchOptions);
    }

    this.repopulateKnownArtifactIds();
  }

  search(text: Query): SearchResult[] {
    return this.miniSearch.search(text, {
      prefix: true,
    });
  }

  repopulateKnownArtifactIds() {
    const storedFields = this.getStoredFields();

    this.knownArtifactIds = new Set();
    for (const storedField of storedFields) {
      this.knownArtifactIds.add(storedField.artifactId);
    }
  }

  private getId(artifactId: string, artifactBlockId: string | undefined): string {
    if (artifactBlockId) {
      return `${artifactId}:${artifactBlockId}`;
    }

    return artifactId;
  }

  /**
    * Helps get around the fact that _storedFields is a protected property
    * and we don't want to have a ts-ignore floating everywhere
    */
  private getStoredFields(): IterableIterator<{
    artifactId: string,
    blockId: string,
    previewText: string,
    artifactTitle: string | undefined,
  }> {
    // @ts-ignore
    return this.miniSearch._storedFields.values();
  }

  hasArtifact(artifactId: string): boolean {
    return this.knownArtifactIds.has(artifactId);
  }

  getKnownArtifactIds(): ReadonlySet<string> {
    return this.knownArtifactIds;
  }

  unindexArtifact(artifactId: string): void {
    const ids = [...this.getStoredFields()].filter((entry) => entry.artifactId === artifactId).map((entry) => this.getId(entry.artifactId, entry.blockId));
    if (ids.length) this.miniSearch.discardAll(ids);
    this.knownArtifactIds.delete(artifactId);
  }

  /**
    * Indexes the artifact title. Indexes/deindexes blockIds passed accordingly.
    * Passed blockIds can be blockIds that have been added or removed.
    *
    * Note: Still not particularly efficient, so reduce calls where possible
    * Avoid using "all" for blockIds if possible, since it must cause a full re-index for that artifact
    */
  indexPartialArtifact(artifactId: string, doc: Doc, blockIds: string[] | "all"): void {
    const artifactJsonContent = getTiptapContentFromYjsDoc(doc, ARTIFACT_TIPTAP_BODY_KEY);
    const jsonContentById = getJSONContentMapById(artifactJsonContent);

    if (blockIds === "all") {
      // We have to unindex because we don't know what _doesn't_ exist in the artifact
      this.unindexArtifact(artifactId);
      blockIds = Object.keys(jsonContentById);
    }

    this.knownArtifactIds.add(artifactId);

    const artifactMeta = getMetaFromYArtifact(doc);
    const artifactIndexId = this.getId(artifactId, undefined);
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
    } else {
      if (this.miniSearch.has(artifactIndexId)) {
        this.miniSearch.discard(artifactIndexId);
      }
    }

    for (const blockId of blockIds) {
      const blockIndexId = this.getId(artifactId, blockId);
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
      } else {
        // Block has been removed from doc, so we remove it from index
        if (this.miniSearch.has(blockIndexId)) {
          this.miniSearch.discard(blockIndexId);
        }
      }
    }
  }

  async destroy(): Promise<void> {
    localStorage.setItem("miniSearch-index", JSON.stringify(this.miniSearch));
  }
}

interface EdgeIdentifier {
  artifactId: string,
  artifactBlockId: string,
  targetArtifactId: string,
  targetArtifactBlockId: string | undefined,
}

interface Edge extends EdgeIdentifier {
  referenceText: string,
}

class EdgeManager {
  constructor(
    private manifestDb: IDBPDatabase,
  ) {}

  getEdgeId(edge: {
    artifactId: string,
    artifactBlockId: string
    targetArtifactId: string,
    targetArtifactBlockId: string | undefined,
  }): string {
    return `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactId}:${edge.targetArtifactBlockId}`;
  }

  async getEdge(identifier: EdgeIdentifier): Promise<Edge | undefined> {
    const edgeId = this.getEdgeId(identifier);

    const edge = await this.manifestDb.get("edges", edgeId);

    return edge;
  }

  async getOutgoingEdges(artifactId: string): Promise<Edge[]> {
    const edges = await this.manifestDb.getAllFromIndex("edges", "artifactId", artifactId);
    console.log("getting", edges);

    return edges;
  }

  async upsertEdge(edge: Edge): Promise<void> {
    const id = this.getEdgeId(edge);

    if (await this.manifestDb.get("edges", id)) {
      await this.manifestDb.put("edges", edge, id);
    } else {
      await this.manifestDb.add("edges", edge, id);
    }
  }

  async deleteEdge(edge: EdgeIdentifier): Promise<void> {
    const id = this.getEdgeId(edge);
    await this.manifestDb.delete("edges", id);
  }

  async updateEdgesReferenceText(
    targetArtifactId: string,
    targetArtifactBlockId: string | undefined,
    referenceText: string,
  ): Promise<void> {
    let edges;
    if (targetArtifactBlockId) {
      edges = await this.manifestDb.getAllFromIndex("edges", "targetArtifactId, targetArtifactBlockId", [targetArtifactId, targetArtifactBlockId]);
    } else {
      edges = await this.manifestDb.getAllFromIndex("edges", "targetArtifactId", [targetArtifactId]);
    }

    for (const edge of edges) {
      const id = this.getEdgeId(edge);
      const updatedEdge = {
        ...edge,
        referenceText,
      };

      await this.manifestDb.put("edges", updatedEdge, id);
    }
  }

  async updateEdgesForYDoc(artifactId: string, doc: Doc, updatedBlockIds: string[]): Promise<void> {
    const artifactJsonContent = getTiptapContentFromYjsDoc(doc, ARTIFACT_TIPTAP_BODY_KEY);
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

      await this.updateEdgesReferenceText(
        artifactId,
        updatedBlockId,
        text,
      );
    }

    // ==== Update Outgoing References ====
    // const outgoingReferences = getReferencesFromJSONContent(artifactJsonContent);
    // for (const outgoingReference of outgoingReferences) {
    // }
  }
}

export class YManager {
  private ws: HocuspocusProviderWebsocket;
  private ready: boolean = false;
  private connectionTrackingManager = new ConnectionTrackingManager();
  private searchManager: SearchManager;
  private syncManager: SyncManager;
  private edgeManager: EdgeManager;

  // private manifestConnection: YConnection;
  // private manifestSynced: boolean = false;

  private openArtifacts: {
    artifactId: string;
    connection: YConnection;
  }[] = [];

  private cleanupOps: (() => void)[] = [];

  constructor(
    private userId: string,
    private token: string,
    private manifestDb: IDBPDatabase,
    onReady: () => void
  ) {
    this.ws = new HocuspocusProviderWebsocket({
      url: getApiUrls().hocuspocus,
      delay: 1000,
      minDelay: 1000,
      maxDelay: 30000,
    });

    this.searchManager = new SearchManager(userId);
    this.syncManager = new SyncManager(this.ws, this.manifestDb, this.searchManager, this.connectionTrackingManager, this.token);
    this.edgeManager = new EdgeManager(this.manifestDb);

    setTimeout(() => onReady());

    // this.manifestConnection = this.createConnection(`manifest:${userId}`, true);

    // const indexeddbProviderSyncListener = () => {
    //   this.resyncSearchIndex();
    // }
    // this.manifestConnection.indexeddbProvider.on("synced", indexeddbProviderSyncListener);
    // this.cleanupOps.push(() => this.manifestConnection.indexeddbProvider.off("synced", indexeddbProviderSyncListener));

    // const manifestChangeListener = (change) => {
    //   if (!synced) return;
    //
    //   this.resyncSearchIndex();
    //   // TODO: update index here
    //   // change.changes.added
    //   // for (const delta of change.changes.delta) {
    //   //   if (delta.delete
    //   //
    //   // }
    //   //
    // }
    // manifestDoc.getMap("manifest").observeDeep(manifestChangeListener);
    // this.cleanupOps.push(() => manifestDoc.getMap("manifest").unobserveDeep(manifestChangeListener));
  }

  connectArtifact(artifactId: string): YConnection {
    const docName = `artifact:${artifactId}`;
    this.connectionTrackingManager.open(docName);
    const existingConnection = this.openArtifacts.find((openArtifact) => openArtifact.artifactId === artifactId);
    if (existingConnection) {
      return existingConnection.connection;
    }

    const newConnection = {
      artifactId,
      connection: this.createConnection(docName)
    }

    newConnection.connection.doc.getMap(ARTIFACT_META_KEY).observeDeep(async () => {
      this.searchManager.indexPartialArtifact(artifactId, newConnection.connection.doc, []);
      await this.syncManager.incrementLocalArtifactVersion(artifactId);
    });

    newConnection.connection.doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY).observeDeep(async (yEvents) => {
      const changedIds = yEvents.map(getTiptapIdsFromYEvent).flat();

      this.searchManager.indexPartialArtifact(artifactId, newConnection.connection.doc, changedIds);
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
    }
    indexeddbProvider.on("sync", idbSyncListener);

    const wsSyncListener = () => {
      connection.tiptapCollabProviderSynced = true;
    }
    tiptapCollabProvider.on("sync", wsSyncListener);

    return connection;
  }

  async isArtifactOnManifest(artifactId: string): Promise<boolean> {
    const entry = await this.manifestDb.getFromIndex("artifactVersions", "artifactId", artifactId);

    return !!entry;
  }

  async createArtifact(params: {
    title: string,
    type: ArtifactType,
    theme: ArtifactTheme,
  }): Promise<string> {
    const id = crypto.randomUUID();

    const conn = this.connectArtifact(id);
    const yMeta = conn.doc.getMap(ARTIFACT_META_KEY);
    yMeta.set("title", params.title);
    yMeta.set("type", params.type);
    yMeta.set("theme", params.theme);

    this.manifestDb.add("artifactVersions", {
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
    return this.edgeManager.getOutgoingEdges(
      artifactId,
    );
  }

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

