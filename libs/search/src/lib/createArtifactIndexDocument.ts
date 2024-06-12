import dedent from 'dedent';
import { ArtifactIndexDocument, IndexableArtifact } from './types';

export const createArtifactIndexDocument = (
  artifact: IndexableArtifact,
): ArtifactIndexDocument => {
  const fullText = dedent`
  ${artifact.title}
  ${artifact.text}
`;

  const document = {
    id: artifact.id,
    userId: artifact.userId,
    title: artifact.title,
    fullText,
  };

  return document;
};
