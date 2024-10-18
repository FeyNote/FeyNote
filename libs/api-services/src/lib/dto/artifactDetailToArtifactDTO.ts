import type { ArtifactDetail } from '@feynote/prisma/types';
import type { ArtifactDTO } from '@feynote/global-types';

const PREVIEW_TEXT_LENGTH = 150;

export const artifactDetailToArtifactDTO = (
  userId: string | undefined,
  { text, artifactPins, ...rest }: ArtifactDetail,
): ArtifactDTO => {
  return {
    ...rest,
    isPinned: artifactPins.some((pin) => pin.userId === userId),
    previewText: text.substring(0, PREVIEW_TEXT_LENGTH),
  };
};
