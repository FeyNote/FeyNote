import type { ArtifactDetail } from '@feynote/prisma/types';
import type { ArtifactDTO } from '@feynote/global-types';

const PREVIEW_TEXT_LENGTH = 150;

export const artifactDetailToArtifactDTO = (
  userId: string | undefined,
  { text, ...rest }: ArtifactDetail,
): ArtifactDTO => {
  return {
    ...rest,
    previewText: text.substring(0, PREVIEW_TEXT_LENGTH),
  };
};
