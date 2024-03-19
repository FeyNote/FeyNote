import dedent from 'dedent';
import { ArtifactIndexDocument } from './types';
import { ArtifactFieldsSummary } from '@dnd-assistant/prisma/types';

export const createArtifactIndexDocument = (
  artifact: ArtifactFieldsSummary
): ArtifactIndexDocument => {
  const { id, userId, title, visibility, fields } = artifact;

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
    visibility,
    fullText,
    id,
  };

  return document;
};
