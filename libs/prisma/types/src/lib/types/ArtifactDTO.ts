import type { ArtifactDetail } from './artifactDetail';

export type ArtifactDTO = Omit<ArtifactDetail, 'text' | 'artifactPins'> & {
  isPinned: boolean;
  previewText: string;
};
