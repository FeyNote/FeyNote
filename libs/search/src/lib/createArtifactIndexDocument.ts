import dedent from 'dedent';
import { ArtifactIndexDocument } from './types';
import { IndexableArtifact } from '@dnd-assistant/prisma/types';

export const createArtifactIndexDocument = (
  artifact: IndexableArtifact
): ArtifactIndexDocument => {
  const { id, userId, title, artifactFields } = artifact;

  const fullFieldText = artifactFields.reduce((acc, field) => {
    const allFieldText = `${acc} ${field.title}`;
    if (field.text) {
      return `${allFieldText} ${field.text}\n`;
    }
    const imageTitleStr = field.artifactImages.reduce(
      (acc, artifactImage) => `${acc} ${artifactImage.image.title}`,
      ''
    );
    return `${acc} ${imageTitleStr}\n`;
  }, '');

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
