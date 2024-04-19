import { IndexableArtifact } from '@dnd-assistant/prisma/types';

export interface SearchProvider {
  indexArtifact: (artifact: IndexableArtifact) => Promise<void>;
  indexBlocks: (artifact: IndexableArtifact) => Promise<void>;
  deleteArtifacts: (artifactIds: string[]) => Promise<void>;
  searchArtifacts: (
    userId: string,
    query: string,
    withEmbeddings?: boolean
  ) => Promise<string[]>;
  searchBlocks: (
    userId: string,
    query: string
  ) => Promise<BlockIndexDocument[]>;
}

export interface ArtifactIndexDocument {
  userId: string;
  title: string;
  fullText: string;
  id: string;
}

export interface BlockIndexDocument {
  id: string;
  userId: string;
  artifactId: string;
  text: string;
}

export enum AvailableSearchProviders {
  Typesense = 'typesense',
}

export enum Indexes {
  Artifact = 'artifact',
  Block = 'block',
}
