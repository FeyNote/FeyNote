import {
  IndexableArtifact,
  BlockIndexDocument,
  Indexes,
  SearchProvider,
} from './types';
import { Client } from 'typesense';
import { globalServerConfig } from '@feynote/config';
import { createArtifactIndexDocument } from './createArtifactIndexDocument';
import {
  getTextForJSONContent,
  jsonContentForEach,
  getIdForJSONContent,
  getJSONContentDiff,
} from '@feynote/shared-utils';
import { isIndexable } from './indexableCharacters';

export class TypeSense implements SearchProvider {
  private readonly client = new Client({
    nodes: JSON.parse(globalServerConfig.typesense.nodes),
    apiKey: globalServerConfig.typesense.apiKey,
    numRetries: 10,
    retryIntervalSeconds: 1,
    connectionTimeoutSeconds: 10,
  });

  constructor() {
    this.init();
  }

  private async init() {
    console.log('Establishing a connection to typesense');
    const doesArtifactIndexExist = await this.client
      .collections(Indexes.Artifact)
      .exists();
    const doesBlockIndexExist = await this.client
      .collections(Indexes.Block)
      .exists();
    console.log('Established a connection to typesense');

    if (!doesArtifactIndexExist) {
      await this.createArtifactIndex();
    }
    if (!doesBlockIndexExist) {
      await this.createBlockIndex();
    }
  }

  async indexArtifact(artifact: IndexableArtifact) {
    const artifactIndexDocument = createArtifactIndexDocument(artifact);

    await this.client
      .collections(Indexes.Artifact)
      .documents()
      .import([artifactIndexDocument], {
        action: 'upsert',
      });

    await this.indexBlocks(artifact);
  }

  async indexBlocks(artifact: IndexableArtifact) {
    if (!artifact.newState.jsonContent) {
      // Artifact no longer has block content
      return this.deleteBlocksByArtifactIds([artifact.id]);
    }

    const oldReadableUserIds = artifact.oldState.readableUserIds.sort((a, b) =>
      a.localeCompare(b),
    );
    const newReadableUserIds = artifact.newState.readableUserIds.sort((a, b) =>
      a.localeCompare(b),
    );
    const sharedUserIdsIdentical = oldReadableUserIds.every(
      (value, index) => value === newReadableUserIds[index],
    );
    if (!artifact.oldState.jsonContent || !sharedUserIdsIdentical) {
      // Either:
      // 1. Artifact never had block content before, so full reindex
      // 2. Sharing changed for the artifact, so full reindex
      return this.reindexBlocks(artifact);
    }

    // Artifact is an update. To save time, we only update blocks that have been added, modified, or deleted
    const diff = getJSONContentDiff(
      artifact.oldState.jsonContent,
      artifact.newState.jsonContent,
    );

    const upsertBlocks: BlockIndexDocument[] = [];
    const deleteBlocks: BlockIndexDocument[] = [];
    for (const [id, diffItem] of diff.entries()) {
      if (diffItem.status === 'deleted') {
        deleteBlocks.push({
          id,
          text: diffItem.oldText,
          userId: artifact.userId,
          readableUserIds: artifact.oldState.readableUserIds,
          artifactId: artifact.id,
        });
        continue;
      }

      upsertBlocks.push({
        id,
        text: diffItem.newText,
        userId: artifact.userId,
        readableUserIds: artifact.newState.readableUserIds,
        artifactId: artifact.id,
      });
    }

    if (deleteBlocks.length) {
      await this.deleteBlocksByIds(deleteBlocks.map((el) => el.id));
    }

    if (upsertBlocks.length) {
      await this.client
        .collections(Indexes.Block)
        .documents()
        .import(upsertBlocks, {
          action: 'upsert',
        });
    }
  }

  /**
   * Removes all existing block entries and re-creates them
   */
  private async reindexBlocks(artifact: IndexableArtifact) {
    if (!artifact.newState.jsonContent) return;

    const blocks: BlockIndexDocument[] = [];
    jsonContentForEach(artifact.newState.jsonContent, (jsonContent) => {
      const id = getIdForJSONContent(jsonContent);
      // We only want to index things that have an identifier
      if (!id) return;

      const text = getTextForJSONContent(jsonContent);
      if (!isIndexable(text)) return;

      const block = {
        id,
        text,
        userId: artifact.userId,
        readableUserIds: artifact.newState.readableUserIds,
        artifactId: artifact.id,
      } satisfies BlockIndexDocument;

      blocks.push(block);
    });

    await this.deleteBlocksByArtifactIds([artifact.id]);
    if (!blocks.length) return;

    await this.client.collections(Indexes.Block).documents().import(blocks, {
      action: 'upsert',
    });
  }

  async deleteArtifacts(artifactIds: string[]) {
    await this.client
      .collections(Indexes.Artifact)
      .documents()
      .delete({
        filter_by: `id:=[${artifactIds.join(', ')}]`,
      });

    await this.deleteBlocksByArtifactIds(artifactIds);
  }

  async searchArtifacts(userId: string, query: string) {
    const query_by = 'title,fullText';

    const results = await this.client
      .collections(Indexes.Artifact)
      .documents()
      .search({
        q: query,
        query_by,
        filter_by: `readableUserIds:=[${userId}]`,
        per_page: 250,
        limit_hits: 250,
      });

    return (
      results.hits?.map((hit) => {
        return (hit.document as Record<string, string>)['id'];
      }) || []
    );
  }
  async searchArtifactTitles(userId: string, query: string) {
    const query_by = 'title';

    const results = await this.client
      .collections(Indexes.Artifact)
      .documents()
      .search({
        q: query,
        query_by,
        filter_by: `readableUserIds:=[${userId}]`,
        per_page: 250,
        limit_hits: 250,
      });

    return (
      results.hits?.map((hit) => {
        return (hit.document as Record<string, string>)['id'];
      }) || []
    );
  }
  async searchArtifactBlocks(
    userId: string,
    query: string,
    options?: {
      prefix: boolean; // Matches parts of words, so typing "hipp" will match "hippopotamus"
    },
  ) {
    const results = await this.client
      .collections(Indexes.Block)
      .documents()
      .search({
        q: query,
        query_by: 'text',
        prefix: options?.prefix || false,
        filter_by: `readableUserIds:=[${userId}]`,
        per_page: 250,
        limit_hits: 250,
      });

    return (
      results.hits?.map((hit) => {
        return hit.document as BlockIndexDocument;
      }) || []
    );
  }

  private async createBlockIndex() {
    await this.client.collections().create({
      name: Indexes.Block,
      enable_nested_fields: true,
      fields: [
        {
          name: 'id',
          type: 'string',
          facet: true,
          optional: false,
        },
        {
          name: 'userId',
          type: 'string',
          facet: true,
          optional: false,
        },
        {
          name: 'readableUserIds',
          type: 'string[]',
          facet: true,
          optional: false,
        },
        {
          name: 'text',
          type: 'string',
          optional: false,
        },
        {
          name: 'artifactId',
          type: 'string',
          optional: false,
        },
      ],
    });
  }
  private async createArtifactIndex() {
    await this.client.collections().create({
      name: Indexes.Artifact,
      enable_nested_fields: true,
      fields: [
        {
          name: 'id',
          type: 'string',
          facet: true,
          optional: false,
        },
        {
          name: 'userId',
          type: 'string',
          facet: true,
          optional: false,
        },
        {
          name: 'readableUserIds',
          type: 'string[]',
          facet: true,
          optional: false,
        },
        {
          name: 'title',
          type: 'string',
          optional: false,
        },
        {
          name: 'fullText',
          type: 'string',
          optional: false,
        },
      ],
    });
  }
  private async deleteBlocksByArtifactIds(artifactIds: string[]) {
    await this.client
      .collections(Indexes.Block)
      .documents()
      .delete({
        filter_by: `artifactId:=[${artifactIds.join(', ')}]`,
      });
  }
  private async deleteBlocksByIds(ids: string[]) {
    const PAGE_SIZE = 50;
    const totalPages = Math.ceil(ids.length / PAGE_SIZE);
    for (let page = 0; page < totalPages; page++) {
      const items = ids.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
      await this.client
        .collections(Indexes.Block)
        .documents()
        .delete({
          filter_by: `id:=[${items.join(', ')}]`,
        });
    }
  }
}
