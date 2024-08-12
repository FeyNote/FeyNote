import type { ArtifactDetail } from './artifactDetail';

export type ArtifactDTO = Omit<ArtifactDetail, 'text'> & {
  previewText: string;
};
