import { useCurrentWorkspaceId } from '../../workspace/useCurrentWorkspaceId';
import { useArtifactSnapshotsForWorkspaceId } from './useArtifactSnapshotsForWorkspaceId';

export const useArtifactSnapshotsForCurrentWorkspace = () => {
  const { currentWorkspaceId } = useCurrentWorkspaceId();

  const { artifactSnapshotsForWorkspace } = useArtifactSnapshotsForWorkspaceId(
    currentWorkspaceId || '',
  );

  return {
    artifactSnapshotsForWorkspace: currentWorkspaceId
      ? artifactSnapshotsForWorkspace
      : null,
  };
};
