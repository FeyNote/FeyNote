import dedent from 'dedent';
import { ArtifactIndexDocument } from './types';
import { IndexableArtifact } from '@dnd-assistant/prisma/types';

export const createArtifactIndexDocument = (
  artifact: IndexableArtifact
): ArtifactIndexDocument => {
  const { id, userId, title, fields } = artifact;

  const fullFieldText = fields.reduce(
    (acc, field) => acc + ' ' + field.text,
    ''
  );

  const fullText = dedent`
  ${title}
  ${fullFieldText}
`;

  const document = {
    userId,
    title,
    fullText,
    id,
  };

  return document;
};
