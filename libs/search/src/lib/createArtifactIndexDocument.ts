import { ArtifactIndexDocument, IndexableArtifact } from './types';

export const createArtifactIndexDocument = (
  artifact: IndexableArtifact,
): ArtifactIndexDocument => {
  const document = {
    id: artifact.id,
    userId: artifact.userId,
    readableUserIds: artifact.newState.readableUserIds,
    workspaceIds: artifact.newState.workspaceIds,
    title: artifact.newState.title,
    fullText: artifact.newState.text,
  };

  return document;
};
