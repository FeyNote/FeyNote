import type { YArtifactMeta } from './YArtifactMeta';
import type { YArtifactUserAccess } from './YArtifactUserAccess';

/**
 * This type must be kept performant, as there
 * maybe tens of thousands of artifacts in a user's collection
 * and these are kept in RAM!
 */
export type ArtifactSnapshot = {
  id: string;
  meta: YArtifactMeta;
  userAccess: {
    key: string;
    val: YArtifactUserAccess;
  }[];
  updatedAt: number;
  createdLocally: boolean;
};
