import MiniSearch, {
  type Options,
  type Query,
  type SearchResult,
} from 'minisearch';
import { IDBPDatabase } from 'idb';
import { Doc } from 'yjs';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  ARTIFACT_TIPTAP_BODY_KEY,
  getJSONContentMapById,
  getMetaFromYArtifact,
  getTextForJSONContent,
  getTiptapContentFromYjsDoc,
} from '../../../../libs/shared-utils/src';
import { KVStoreKeys, ObjectStoreName } from './localDb';
import { getIsViteDevelopment } from './getIsViteDevelopment';

/**
 * Enables some additional logging which is helpful for debugging
 */
const ENABLE_VERBOSE_INDEX_LOGGING = getIsViteDevelopment();

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

export interface StoredSearchFields {
  artifactId: string;
  blockId: string | undefined;
  previewText: string;
  artifactTitle: string | undefined;
}

export class SearchManager {
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

  search(text: Query): (SearchResult & StoredSearchFields)[] {
    return Array.from(
      this.miniSearch.search(text, {
        prefix: true,
      }),
    ) as (SearchResult & StoredSearchFields)[]; // Thanks minisearch typings...
  }

  async populateFromLocalDb() {
    performance.mark('startIndexLoad');

    const indexRecord = await this.manifestDb.get(
      ObjectStoreName.KV,
      KVStoreKeys.SearchIndex,
    );

    if (!indexRecord) return;

    try {
      this.miniSearch = MiniSearch.loadJSON(
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
  private getStoredFields(): IterableIterator<StoredSearchFields> {
    // @ts-expect-error _storedFields is a protected property
    return this.miniSearch._storedFields.values();
  }

  getStoredFieldsForArtifactId(
    artifactId: string,
  ): StoredSearchFields | undefined {
    return this.miniSearch.getStoredFields(
      this.getIndexId(artifactId, undefined),
    ) as any;
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

    if (
      await this.manifestDb.get(ObjectStoreName.KV, KVStoreKeys.SearchIndex)
    ) {
      await this.manifestDb.put(ObjectStoreName.KV, {
        key: KVStoreKeys.SearchIndex,
        value: JSON.stringify(this.miniSearch),
      });
    } else {
      await this.manifestDb.add(ObjectStoreName.KV, {
        key: KVStoreKeys.SearchIndex,
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
