import dedent from 'dedent';
import { ArtifactIndexDocument, IndexableArtifact } from './types';

export const createArtifactIndexDocument = (
  artifact: IndexableArtifact,
): ArtifactIndexDocument => {
  const fullText = dedent`
  ${artifact.newState.title}
  ${artifact.newState.text}
`;

  const document = {
    id: artifact.id,
    userId: artifact.userId,
    readableUserIds: artifact.newState.readableUserIds,
    title: artifact.newState.title,
    fullText,
  };

  return document;
};
