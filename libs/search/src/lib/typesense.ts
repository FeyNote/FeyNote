import { BlockIndexDocument, Indexes, SearchProvider } from './types';
import { Client } from 'typesense';
import { Block } from '@blocknote/core';
import { IndexableArtifact } from '@dnd-assistant/prisma/types';
import { config } from '@dnd-assistant/api-services';
import { createArtifactIndexDocument } from './createArtifactIndexDocument';
import { getBlocksByStringQuery } from '@dnd-assistant/shared-utils';

export class TypeSense implements SearchProvider {
  private readonly client = new Client({
    nodes: JSON.parse(config.typesense.nodes),
    apiKey: config.typesense.apiKey,
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
    const doesBlockNoteIndexExist = await this.client
      .collections(Indexes.Block)
      .exists();
    console.log('Established a connection to typesense');

    if (!doesArtifactIndexExist) {
      await this.createArtifactIndex();
    }
    if (!doesBlockNoteIndexExist) {
      await this.createBlocknoteIndex();
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
    const artifactBlock = artifact.json as Block;
    const blocks = getBlocksByStringQuery('*', [artifactBlock]).map(
      (blockQueryResult) => {
        const block = {
          id: blockQueryResult.block.id,
          text: blockQueryResult.matchedText,
          userId: artifact.userId,
          artifactId: artifact.id,
        };
        return block;
      }
    );

    await this.deleteBlocksByArtifactIds([artifact.id]);

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

  async searchArtifacts(
    userId: string,
    query: string,
    withEmbeddings?: boolean
  ) {
    const query_by = withEmbeddings
      ? 'fullTextEmbedding,fullText'
      : 'title,fullText';
    const vector_query = withEmbeddings
      ? 'fullTextEmbedding:([], distance_threshold:.75)'
      : undefined;

    const results = await this.client
      .collections(Indexes.Artifact)
      .documents()
      .search({
        q: query,
        query_by,
        prefix: false,
        vector_query,
        filter_by: `userId:=[${userId}]`,
        per_page: 250,
        limit_hits: 250,
      });

    return (
      results.hits?.map((hit) => {
        return (hit.document as Record<string, string>)['id'];
      }) || []
    );
  }
  async searchBlocks(userId: string, query: string) {
    const query_by = 'text';

    const results = await this.client
      .collections(Indexes.Block)
      .documents()
      .search({
        q: query,
        query_by,
        prefix: false,
        filter_by: `userId:=[${userId}]`,
        per_page: 250,
        limit_hits: 250,
      });

    return (
      results.hits?.map((hit) => {
        console.log(hit.document);
        return hit.document as BlockIndexDocument;
      }) || []
    );
  }

  private async createBlocknoteIndex() {
    await this.client.collections().create({
      name: Indexes.Block,
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
          name: 'title',
          type: 'string',
          optional: false,
        },
        {
          name: 'fullText',
          type: 'string',
          optional: false,
        },
        {
          name: 'fullTextEmbedding',
          type: 'float[]',
          embed: {
            from: ['fullText'],
            model_config: {
              model_name: 'openai/text-embedding-3-large',
              api_key: config.openai.apiKey,
            },
          },
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
}
