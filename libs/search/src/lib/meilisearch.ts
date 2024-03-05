import { MeiliSearch as Client, MeiliSearchApiError } from 'meilisearch';
import { Indexes, SearchProvider } from './types';
import dedent from 'dedent';
import { prisma } from '@dnd-assistant/prisma/client';

export class MeiliSearch implements SearchProvider {
  private client;
  constructor() {
    if (!process.env['MEILI_HOST'] || !process.env['MEILI_API_KEY']) {
      throw new Error('Meilisearch host and api key are required');
    }
    this.client = new Client({
      host: process.env['MEILI_HOST'],
      apiKey: process.env['MEILI_API_KEY'],
    });
  }

  async initializeArtifactsIndex() {
    try {
      await this.client.getIndex(Indexes.Artifacts);
    } catch (e) {
      if (e instanceof MeiliSearchApiError && e.code === 'index_not_found') {
        console.log('Creating meilisearch index');

        await this.client.createIndex(Indexes.Artifacts, {
          primaryKey: 'id',
        });
      } else {
        throw e;
      }
    }

    await this.client
      .index(Indexes.Artifacts)
      .updateFilterableAttributes(['id', 'userId']);
  }

  async indexArtifacts(artifactIds: string[]) {
    if (!artifactIds.length) return Promise.resolve();

    const artifacts = await prisma.artifact.findMany({
      where: {
        id: { in: artifactIds },
      },
      select: {
        id: true,
        title: true,
        userId: true,
        visibility: true,
        fields: {
          select: {
            text: true,
          },
        },
      },
    });

    const artifactIndexes = artifacts.map((artifact) => {
      const { id, userId, title, visibility, fields } = artifact;

      const fullFieldText = fields.reduce(
        (acc, field) => acc + ' ' + field.text,
        ''
      );

      const fullText = dedent`
        ${title}
        ${fullFieldText}
      `;

      const artifactIndex = {
        id,
        userId,
        title,
        visibility,
        fullText,
      };

      return artifactIndex;
    });

    await this.client.index(Indexes.Artifacts).addDocuments(artifactIndexes, {
      primaryKey: 'id',
    });
  }

  async deleteArtifacts(artifactIds: string[]) {
    if (!artifactIds.length) return Promise.resolve();
    await this.client.index(Indexes.Artifacts).deleteDocuments(artifactIds);
  }

  async searchArtifacts(userId: string, query: string) {
    const results = await this.client.index(Indexes.Artifacts).search(query, {
      filter: `userId IN [${userId}]`,
      attributesToRetrieve: ['id'],
    });

    return results.hits.map((hit) => hit['id'] satisfies string);
  }
}
