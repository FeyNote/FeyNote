import type { ArtifactDetail, ArtifactDTO } from '@feynote/prisma/types';

const PREVIEW_TEXT_LENGTH = 150;

export const artifactDetailToArtifactDTO = ({
  text,
  ...rest
}: ArtifactDetail): ArtifactDTO => {
  return {
    ...rest,
    previewText: text.substring(0, PREVIEW_TEXT_LENGTH),
  };
};
