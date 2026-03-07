import type { WorkspaceMeta } from './WorkspaceMeta';
import type { YArtifactUserAccess } from './YArtifactUserAccess';

/**
 * This type must be kept relatively small as these are kept in RAM
 */
export type WorkspaceSnapshot = {
  id: string;
  meta: WorkspaceMeta;
  userAccess: {
    key: string;
    val: YArtifactUserAccess;
  }[];
  updatedAt: number;
  artifactIds: string[];
  threadIds: string[];
  createdLocally: boolean;
};
