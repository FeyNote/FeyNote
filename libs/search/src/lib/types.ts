import { JSONContent } from '@tiptap/core';

export interface IndexableArtifact {
  id: string;
  userId: string;
  oldState: {
    title: string;
    text: string;
    jsonContent: JSONContent | null;
  };
  newState: {
    title: string;
    text: string;
    jsonContent: JSONContent | null;
  };
}

export interface SearchProvider {
  indexArtifact: (artifact: IndexableArtifact) => Promise<void>;
  indexBlocks: (artifact: IndexableArtifact) => Promise<void>;
  deleteArtifacts: (artifactIds: string[]) => Promise<void>;
  searchArtifacts: (userId: string, query: string) => Promise<string[]>;
  searchArtifactTitles: (userId: string, query: string) => Promise<string[]>;
  searchArtifactBlocks: (
    userId: string,
    query: string,
    options?: {
      prefix: boolean;
    },
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
