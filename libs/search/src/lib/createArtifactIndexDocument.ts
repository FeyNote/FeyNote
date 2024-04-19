import dedent from 'dedent';
import { ArtifactIndexDocument } from './types';
import { IndexableArtifact } from '@dnd-assistant/prisma/types';

export const createArtifactIndexDocument = (
  artifact: IndexableArtifact
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
