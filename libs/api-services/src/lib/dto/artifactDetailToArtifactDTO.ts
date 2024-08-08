import type {
  ArtifactDetail,
  ArtifactDTO,
  ArtifactJson,
} from '@feynote/prisma/types';

const PREVIEW_TEXT_LENGTH = 150;

export const artifactDetailToArtifactDTO = ({
  text,
  json,
  ...rest
}: ArtifactDetail): ArtifactDTO => {
  return {
    ...rest,
    json: json as ArtifactJson,
    previewText: text.substring(0, PREVIEW_TEXT_LENGTH),
  };
};
