export interface SearchProvider {
  indexArtifacts: (artifactIds: string[]) => Promise<void>;
  deleteArtifacts: (artifactIds: string[]) => Promise<void>;
  searchArtifacts: (
    userId: string,
    query: string,
    withEmbeddings?: boolean
  ) => Promise<string[]>;
}

export interface ArtifactIndexDocument {
  userId: string;
  title: string;
  fullText: string;
  id: string;
}

export enum AvailableSearchProviders {
  Typesense = 'typesense',
}

export enum Indexes {
  Artifacts = 'artifacts',
}
