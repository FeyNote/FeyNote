import { Visibility } from '@prisma/client';

export interface SearchProvider {
  indexArtifacts: (artifactIds: string[]) => Promise<void>;
  deleteArtifacts: (artifactIds: string[]) => Promise<void>;
  searchArtifacts: (userId: string, query: string) => Promise<string[]>;
}

export interface ArtifactIndexDocument {
  userId: string;
  title: string;
  visibility: Visibility;
  fullText: string;
}

export enum AvailableSearchProviders {
  ElasticSearch = 'elasticsearch',
  MeiliSearch = 'meilisearch',
}

export enum Indexes {
  Artifacts = 'artifacts',
}
