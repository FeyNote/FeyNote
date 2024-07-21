import { HocuspocusProvider, HocuspocusProviderWebsocket } from '@hocuspocus/provider';
import { getApiUrls } from '../../utils/getApiUrls';
import { IndexeddbPersistence } from 'y-indexeddb';
import { Doc, decodeUpdate, type YEvent } from 'yjs';
import MiniSearch from 'minisearch';
import { openDB, deleteDB, wrap, unwrap, IDBPDatabase } from 'idb';
import { ARTIFACT_META_KEY, ARTIFACT_TIPTAP_BODY_KEY, ArtifactTheme, ArtifactType, getJSONContentMapById, getMetaFromYArtifact, getReferencesFromJSONContent, getTextForJSONContent, getTiptapContentFromYjsDoc } from '@feynote/shared-utils';
import { trpc } from '../../utils/trpc';
import { t } from 'i18next';

const MANIFEST_SYNC_INTERVAL = 10000;

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

class SyncManager {
  private syncing: boolean = false;
  private syncInterval: NodeJS.Timeout;
  // private ws: HocuspocusProviderWebsocket;

  constructor(
    private ws: HocuspocusProviderWebsocket,
    private manifestDb: IDBPDatabase,
    private searchManager: SearchManager,
    private connectionTrackingManager: ConnectionTrackingManager,
    private token: string,
  ) {
    // this.ws = new HocuspocusProviderWebsocket({
    //   url: getApiUrls().hocuspocus,
    //   delay: 1000,
    //   minDelay: 1000,
    //   maxDelay: 30000,
    // });

    this.syncManifest();

    this.syncInterval = setInterval(() => {
      this.syncManifest();
    }, MANIFEST_SYNC_INTERVAL);
  }

  getDocName(artifactId: string) {
    return `artifact:${artifactId}`;
  }

  private async syncManifest() {
    if (this.syncing) {
      console.log("Sync already in progress");
      return;
    }

    performance.mark("startSync");

    console.log("Syncing!");
    this.syncing = true;

    const latestManifest = await trpc.user.syncManifest.query();

    // ==== Update Artifact References ====
    const localEdges = await this.manifestDb.getAll("edges");
    const localEdgeIds = new Set(localEdges.map((edge) => edge.id));
    const remoteEdgeIds = new Set(latestManifest.edges.map((edge) => `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactBlockId}:${edge.targetArtifactBlockId}`));

    for (const edge of latestManifest.edges) {
      const edgeId = `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactBlockId}:${edge.targetArtifactBlockId}`;
      if (localEdgeIds.has(edgeId)) {
        await this.manifestDb.put("edges", edge, edgeId);
      } else {
        await this.manifestDb.add("edges", edge, edgeId);
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
        console.log("adding", version, artifactId);
        await this.manifestDb.add("artifactVersions", {
          artifactId,
          version
        });
        needsSync.add(artifactId);
      } else if (localArtifactVersions[artifactId] !== version) {
        await this.manifestDb.put("artifactVersions", {
          artifactId,
          version,
        });
        needsSync.add(artifactId);
      }
    }

    for (const [artifactId, version] of Object.entries(localArtifactVersions)) {
      if (!latestManifest.artifactVersions[artifactId] || latestManifest.artifactVersions[artifactId] !== version) {
        await this.manifestDb.put("artifactVersions", {
          artifactId,
          version: latestManifest.artifactVersions[artifactId] || 1,
        });
        needsSync.add(artifactId);
      }
    }

    const cleanupFns = await Promise.all(
      [...needsSync].map((artifactId) => {
        const docName = this.getDocName(artifactId);
        if (this.connectionTrackingManager.isOpen(docName)) return;

        return this.sync(artifactId);
      })
    );

    await Promise.all(cleanupFns.map((cleanupFn) => cleanupFn?.()));

    this.syncing = false;

    performance.mark("endSync");
    const measure = performance.measure(
      "syncTime",
      "startSync",
      "endSync"
    );
    console.log(`Syncing complete. ${needsSync.size} items updated in ${measure.duration}ms.`);
  }

  private async sync(artifactId: string) {
    const docName = this.getDocName(artifactId);
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

      this.searchManager.indexPartialArtifact(artifactId, doc, changedIds);
    };
    doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY).observeDeep(observeListener);

    const idbSyncP = new Promise<void>((resolve) => {
      indexeddbProvider.on("synced", () => {
        console.log("Artifact IDBSync");
        resolve();
      });
    });
    const ttpSyncP = new Promise<void>((resolve) => {
      tiptapCollabProvider.on("sync", () => {
        console.log("Artifact TTPSync");
        resolve();
      });
    });

    await Promise.all([idbSyncP, ttpSyncP]);

    return async () => {
      doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY).unobserveDeep(observeListener);
      tiptapCollabProvider.destroy();
      await indexeddbProvider.destroy();
      this.connectionTrackingManager.close(docName);
    }
  }

  destroy() {
    clearInterval(this.syncInterval);
    this.ws.destroy();
  }
}

class SearchManager {
  private miniSearch: MiniSearch;
  private indexedDocumentsByArtifactId: Map<string, Set<string>> = new Map();

  constructor() {
    // TODO: Initial population of search index
    const index = localStorage.getItem("miniSearch-index");
    if (index) {
      this.miniSearch = MiniSearch.loadJSON(index, {
        fields: ["text"],
        storeFields: ["artifactId", "blockId", "artifactTitle", "previewText"],
      });
    } else {
      this.miniSearch = new MiniSearch({
        fields: ["text"],
        storeFields: ["artifactId", "blockId", "artifactTitle", "previewText"],
      });
    }
  }

  search(text: string) {
    return this.miniSearch.search(text, {
      prefix: true,
    });
  }

  private getId(artifactId: string, artifactBlockId: string | undefined) {
    if (artifactBlockId) {
      return `${artifactId}-${artifactBlockId}`;
    }

    return artifactId;
  }

  indexArtifact(artifactId: string, doc: Doc) {
    let indexedMemberIds = this.indexedDocumentsByArtifactId.get(artifactId);
    if (!indexedMemberIds) {
      indexedMemberIds = new Set();
      this.indexedDocumentsByArtifactId.set(artifactId, indexedMemberIds);
    }
    if (indexedMemberIds.size > 0) {
      this.miniSearch.discardAll([...indexedMemberIds]);
      indexedMemberIds.clear();
    }

    const artifactMeta = getMetaFromYArtifact(doc);
    const artifactJsonContent = getTiptapContentFromYjsDoc(doc, ARTIFACT_TIPTAP_BODY_KEY);
    const artifactIndexDoc = {
      id: artifactId,
      artifactId,
      text: artifactMeta.title,
      artifactTitle: artifactMeta.title,
      previewText: artifactMeta.title,
    };
    if (this.miniSearch.has(artifactId)) {
      this.miniSearch.replace(artifactIndexDoc);
    } else {
      this.miniSearch.add(artifactIndexDoc);
    }
    indexedMemberIds.add(this.getId(artifactId, undefined));

    const jsonContentEntries = getJSONContentMapById(artifactJsonContent).entries();
    for (const [blockId, blockJsonContent] of jsonContentEntries) {
      const blockText = getTextForJSONContent(blockJsonContent);

      const id = this.getId(artifactId, blockId);
      const artifactBlockIndexDoc = {
        id,
        artifactId,
        blockId,
        text: blockText,
        artifactTitle: artifactMeta.title,
        previewText: blockText.substring(0, 100),
      };
      if (this.miniSearch.has(id)) {
        this.miniSearch.replace(artifactBlockIndexDoc);
      } else {
        this.miniSearch.add(artifactBlockIndexDoc);
      }
      indexedMemberIds.add(id);
    }
  }

  /**
    * Indexes only what has changed. Still not particularly efficient, so reduce calls where possible
    */
  indexPartialArtifact(artifactId: string, doc: Doc, blockIds: string[]) {
    const artifactJsonContent = getTiptapContentFromYjsDoc(doc, ARTIFACT_TIPTAP_BODY_KEY);
    const jsonContentById = getJSONContentMapById(artifactJsonContent);
    let indexedMemberIds = this.indexedDocumentsByArtifactId.get(artifactId);
    if (!indexedMemberIds) {
      indexedMemberIds = new Set();
      this.indexedDocumentsByArtifactId.set(artifactId, indexedMemberIds);
    }

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
      indexedMemberIds.add(artifactIndexId);
    } else {
      if (this.miniSearch.has(artifactIndexId)) {
        this.miniSearch.discard(artifactIndexId);
      }
      indexedMemberIds.delete(artifactIndexId);
    }

    for (const blockId of blockIds) {
      const blockIndexId = this.getId(artifactId, blockId);
      const jsonContent = jsonContentById.get(blockId);
      if (jsonContent) {
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
        indexedMemberIds.add(blockIndexId);
      } else {
        if (this.miniSearch.has(blockIndexId)) {
          this.miniSearch.discard(blockIndexId);
          indexedMemberIds.delete(blockIndexId);
        }
      }
    }
  }

  destroy() {
    localStorage.setItem("miniSearch-index", JSON.stringify(this.miniSearch));
  }
}

interface Edge {
  artifactId: string,
  artifactBlockId: string,
  targetArtifactId: string,
  targetArtifactBlockId: string | undefined,
  referenceText: string,
}

class EdgeManager {
  constructor(
    private manifestDb: IDBPDatabase,
  ) {}

  getEdgeId(edge: Edge) {
    return `${edge.artifactId}:${edge.artifactBlockId}:${edge.targetArtifactBlockId}:${edge.targetArtifactBlockId}`;
  }

  async upsertEdge(edge: Edge) {
    const id = this.getEdgeId(edge);

    if (await this.manifestDb.get("edges", id)) {
      await this.manifestDb.put("edges", edge, id);
    } else {
      await this.manifestDb.add("edges", edge, id);
    }
  }

  async deleteEdge(edge: Edge) {
    const id = this.getEdgeId(edge);
    await this.manifestDb.delete("edges", id);
  }

  async updateEdgeReferenceText(
    targetArtifactId: string,
    targetArtifactBlockId: string | undefined,
    referenceText: string,
  ) {
    let edge;
    if (targetArtifactBlockId) {
      edge = await this.manifestDb.getFromIndex("edges", "targetArtifactId, targetArtifactBlockId", [targetArtifactId, targetArtifactBlockId]);
    } else {
      edge = await this.manifestDb.getFromIndex("edges", "targetArtifactId", [targetArtifactId]);
    }

    if (!edge) return false;

    const id = this.getEdgeId(edge);
    const updatedEdge = {
      ...edge,
      referenceText,
    };

    await this.manifestDb.put("edges", updatedEdge, id);

    return true;
  }

  async updateEdgesForYDoc(artifactId: string, doc: Doc, updatedBlockIds: string[]) {
    const artifactJsonContent = getTiptapContentFromYjsDoc(doc, ARTIFACT_TIPTAP_BODY_KEY);
    const jsonContentById = getJSONContentMapById(artifactJsonContent);

    // ==== Update Incoming References ====
    const artifactMeta = getMetaFromYArtifact(doc);
    await this.updateEdgeReferenceText(
      artifactId,
      undefined,
      artifactMeta.title,
    );

    for (const updatedBlockId of updatedBlockIds) {
      const jsonContent = jsonContentById.get(updatedBlockId);
      // TODO: likely need to mark broken reference if this is true
      if (!jsonContent) continue;

      const text = getTextForJSONContent(jsonContent);

      await this.updateEdgeReferenceText(
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

    this.searchManager = new SearchManager();
    this.syncManager = new SyncManager(this.ws, this.manifestDb, this.searchManager, this.connectionTrackingManager, this.token);

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

  // Currently absolute shit performance, connects every artifact in existence

  connectArtifact(artifactId: string) {
    const docName = `artifact:${artifactId}`;
    this.connectionTrackingManager.open(docName);
    const existingConnection = this.openArtifacts.find((openArtifact) => openArtifact.artifactId === artifactId);
    if (existingConnection) {
      return existingConnection.connection;
    }

    const newConnection = {
      artifactId,
      connection: this.createConnection(docName, false)
    }

    newConnection.connection.doc.getXmlFragment(ARTIFACT_TIPTAP_BODY_KEY).observeDeep(async (yEvents) => {
      const changedIds = yEvents.map(getTiptapIdsFromYEvent).flat();

      this.searchManager.indexPartialArtifact(artifactId, newConnection.connection.doc, changedIds);

      // TODO: Fire this for all doc changes, not just tiptap content changes
      const record = await this.manifestDb.get("artifactVersions", artifactId);
      if (record) {
        this.manifestDb.put("artifactVersions", {
          artifactId,
          version: record.version + 1,
        });
      }
    });

    this.openArtifacts.push(newConnection);

    return newConnection.connection;
  }

  private createConnection(docName: string, awareness: boolean) {
    const doc = new Doc();
    const indexeddbProvider = new IndexeddbPersistence(docName, doc);
    this.cleanupOps.push(() => indexeddbProvider.destroy());
    const tiptapCollabProvider = new HocuspocusProvider({
      name: docName,
      document: doc,
      token: this.token,
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

  isArtifactOnManifest(artifactId: string) {
    // const result = this.manifestConnection.doc.getMap("manifest").get(artifactId);

    // return !!result;
    return true;
  }

  async createEdge(
    artifactId: string,
    artifactBlockId: string,
    targetArtifactId: string,
    targetArtifactBlockId: string | undefined,
    referenceText: string,
  ) {
    const edgeId = `${artifactId}:${artifactBlockId}:${targetArtifactId}:${targetArtifactBlockId}`;
    const edge = {
      id: edgeId,
      artifactId,
      artifactBlockId,
      targetArtifactId,
      targetArtifactBlockId,
      referenceText,
    };

    if (await this.manifestDb.get("edges", edgeId)) {
      await this.manifestDb.put("edges", edge, edgeId);
    } else {
      await this.manifestDb.add("edges", edge, edgeId);
    }

    return edge;
  }

  async deleteEdge(
    artifactId: string,
    artifactBlockId: string,
    targetArtifactId: string,
    targetArtifactBlockId: string | undefined,
  ) {

  }

  async createArtifact(params: {
    title: string,
    type: ArtifactType,
    theme: ArtifactTheme,
  }) {
    const id = crypto.randomUUID();

    const conn = this.connectArtifact(id);
    const yMeta = conn.doc.getMap(ARTIFACT_META_KEY);
    yMeta.set("title", params.title);
    yMeta.set("type", params.type);
    yMeta.set("theme", params.theme);

    this.manifestDb.add("artifactVersions", {
      artifactId: id,
      version: 1,
    });

    return id;
  }

  async destroy() {
    await Promise.all(this.cleanupOps.map((op) => op()));
    this.syncManager.destroy();
    this.searchManager.destroy();
    this.ws.destroy();
  }

  search(text: string) {
    return this.searchManager.search(text);
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

