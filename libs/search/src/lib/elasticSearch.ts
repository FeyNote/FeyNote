import { Client } from '@elastic/elasticsearch';
import { ArtifactIndexDocument, Indexes, SearchProvider } from './types';
import dedent from 'dedent';
import { prisma } from '@dnd-assistant/prisma/client';

export class ElasticSearch implements SearchProvider {
  readonly client = new Client({
    node: process.env['ELASTICSEARCH_URI'],
  });

  constructor() {}

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

    const actions = artifacts.map((artifact) => {
      const { id, userId, title, visibility, fields } = artifact;

      const fullFieldText = fields.reduce(
        (acc, field) => acc + ' ' + field.text,
        ''
      );

      const fullText = dedent`
        ${title}
        ${fullFieldText}
      `;

      const document = {
        userId,
        title,
        visibility,
        fullText,
      } satisfies ArtifactIndexDocument;

      const action = {
        index: Indexes.Artifacts,
        id,
        document,
      };

      return action;
    });

    await this.client.bulk({
      body: actions,
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

  async searchArtifacts(userId: string, query: string) {
    const results = await this.client.search({
      index: Indexes.Artifacts,
      body: {
        query: {
          bool: {
            should: [
              {
                prefix: {
                  title: query,
                },
              },
            ],
            must: {
              match_bool_prefix: {
                fullText: {
                  query,
                  fuzziness: 'AUTO',
                },
              },
            },
            filter: {
              terms: {
                userId,
              },
            },
          },
        },
      },
    });
    return results.hits.hits
      .sort((a, b) => (a._score && b._score ? b._score - a._score : 0))
      .map((hit) => hit._id);
  }
}
