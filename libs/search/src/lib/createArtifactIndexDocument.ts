import dedent from 'dedent';
import { ArtifactIndexDocument } from './types';
import { IndexableArtifact } from '@dnd-assistant/prisma/types';

export const createArtifactIndexDocument = (
  artifact: IndexableArtifact
): ArtifactIndexDocument => {
  const { id, userId, title, text } = artifact;

  const fullText = dedent`
  ${title}
  ${text}
`;

  const document = {
    userId,
    title,
    fullText,
    id,
  };

  return document;
};
