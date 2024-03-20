import { Client } from '@elastic/elasticsearch';
import { ArtifactIndexDocument, Indexes, SearchProvider } from './types';
import { indexableArtifact } from '@dnd-assistant/prisma/types';
import { prisma } from '@dnd-assistant/prisma/client';
import { createArtifactIndexDocument } from './createArtifactIndexDocument';

export class ElasticSearch implements SearchProvider {
  readonly client = new Client({
    node: process.env['ELASTICSEARCH_URI'],
  });

  constructor() {
    this.init();
  }

  async init() {
    console.log('Establishing a connection to elasticsearch');
    await this.client.ping();
    console.log('Established a connection to elasticsearch');

    const exists = await this.client.indices.exists({
      index: Indexes.Artifacts,
    });

    if (!exists) {
      await this.client.indices.create({
        index: Indexes.Artifacts,
        body: {
          mappings: {
            properties: {
              title: {
                type: 'text',
                analyzer: 'english', // Enable stemming
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
              fullText: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 10000,
                  },
                },
              },
              userId: {
                type: 'keyword',
              },
            },
          },
        },
      });
    }
  }

  async indexArtifacts(artifactIds: string[]) {
    if (!artifactIds.length) return Promise.resolve();

    const artifacts = await prisma.artifact.findMany({
      where: {
        id: { in: artifactIds },
      },
      ...indexableArtifact,
    });

    const operations = artifacts
      .map((artifactFieldsSummary) => {
        const document = createArtifactIndexDocument(artifactFieldsSummary);
        const action = {
          index: {
            _index: Indexes.Artifacts,
          },
        };

        return [action, document];
      })
      .flat();

    await this.client.bulk({
      operations,
    });
  }

  async deleteArtifacts(artifactIds: string[]) {
    if (!artifactIds.length) return Promise.resolve();
    const actions = artifactIds.map((artifactId) => ({
      delete: {
        index: Indexes.Artifacts,
        id: artifactId,
      },
    }));

    await this.client.bulk({
      body: actions,
    });
  }

  // NOTE: Stemming and Fuzzy Searching Does Not Currently Work
  async searchArtifacts(userId: string, query: string) {
    const results = await this.client.search({
      index: Indexes.Artifacts,
      query: {
        bool: {
          should: [
            {
              prefix: {
                title: query,
              },
            },
          ],
          filter: {
            terms: {
              userId: [userId],
            },
          },
        },
      },
    });
    return results.hits.hits
      .sort((a, b) => (a._score && b._score ? b._score - a._score : 0))
      .map((hit) => hit._source)
      .filter((source): source is ArtifactIndexDocument => !!source)
      .map((source) => source.id);
  }
}
