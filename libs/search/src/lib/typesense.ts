import { prisma } from '@dnd-assistant/prisma/client';
import { Indexes, SearchProvider } from './types';
import { Client } from 'typesense';
import { indexableArtifact } from '@dnd-assistant/prisma/types';
import { config } from '@dnd-assistant/api-services';
import { createArtifactIndexDocument } from './createArtifactIndexDocument';

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
    const exists = await this.client.collections(Indexes.Artifacts).exists();
    console.log('Established a connection to typesense');

    if (!exists) {
      await this.client.collections().create({
        name: Indexes.Artifacts,
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
  }

  async indexArtifacts(artifactIds: string[]) {
    const artifactSummaries = await prisma.artifact.findMany({
      where: {
        id: { in: artifactIds },
      },
      ...indexableArtifact,
    });
    const documents = artifactSummaries.map((artifactSummary) =>
      createArtifactIndexDocument(artifactSummary)
    );

    await this.client
      .collections(Indexes.Artifacts)
      .documents()
      .import(documents, {
        action: 'upsert',
      });
  }

  async deleteArtifacts(artifactIds: string[]) {
    await this.client
      .collections(Indexes.Artifacts)
      .documents()
      .delete({
        filter_by: `id:=[${artifactIds.join(', ')}]`,
      });
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
      .collections(Indexes.Artifacts)
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
}
