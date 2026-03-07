import { JSONContent } from '@tiptap/core';

export interface IndexableArtifact {
  id: string;
  userId: string;
  oldState: {
    title: string;
    text: string;
    readableUserIds: string[];
    workspaceIds: string[];
    jsonContent: JSONContent | null;
  };
  newState: {
    title: string;
    text: string;
    readableUserIds: string[];
    workspaceIds: string[];
    jsonContent: JSONContent | null;
  };
}

export interface SearchArtifactsResult {
  document: ArtifactIndexDocument;
  highlight?: string;
}

export interface SearchArtifactTitlesResult {
  document: ArtifactIndexDocument;
  highlight?: string;
}

export interface SearchArtifactBlocksResult {
  document: BlockIndexDocument;
  highlight?: string;
}

export interface SearchProvider {
  migrate: () => Promise<void>;
  indexArtifact: (artifact: IndexableArtifact) => Promise<void>;
  indexBlocks: (artifact: IndexableArtifact) => Promise<void>;
  updateArtifacts: (
    artifactPartials: (Partial<ArtifactIndexDocument> & {
      id: string;
    })[],
  ) => Promise<void>;
  updateBlocks: (
    blockPartials: (Partial<BlockIndexDocument> & {
      id: string;
    })[],
  ) => Promise<void>;
  updateWorkspaceIds: (
    artifactId: string,
    workspaceIds: string[],
  ) => Promise<void>;
  deleteArtifacts: (artifactIds: string[]) => Promise<void>;
  searchArtifacts: (
    userId: string,
    query: string,
    options?: {
      prefix?: boolean;
      limit?: number;
      workspaceId?: string;
    },
  ) => Promise<SearchArtifactsResult[]>;
  searchArtifactTitles: (
    userId: string,
    query: string,
    options?: {
      prefix?: boolean;
      limit?: number;
      workspaceId?: string;
    },
  ) => Promise<SearchArtifactTitlesResult[]>;
  searchArtifactBlocks: (
    userId: string,
    query: string,
    options?: {
      prefix?: boolean;
      limit?: number;
      workspaceId?: string;
    },
  ) => Promise<SearchArtifactBlocksResult[]>;
}

export interface ArtifactIndexDocument {
  userId: string;
  readableUserIds: string[];
  workspaceIds: string[];
  title: string;
  fullText: string;
  id: string;
}

export interface BlockIndexDocument {
  id: string;
  userId: string;
  readableUserIds: string[];
  workspaceIds: string[];
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
