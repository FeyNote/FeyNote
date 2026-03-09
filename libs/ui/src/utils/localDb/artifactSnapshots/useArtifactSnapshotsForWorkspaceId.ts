import { useMemo } from 'react';
import { useWorkspaceSnapshot } from '../workspaces/useWorkspaceSnapshot';
import { useArtifactSnapshots } from './useArtifactSnapshots';

export const useArtifactSnapshotsForWorkspaceId = (id: string | undefined) => {
  const { workspaceSnapshot } = useWorkspaceSnapshot(id);
  const { getArtifactSnapshotById } = useArtifactSnapshots();

  const artifactSnapshotsForWorkspace = useMemo(() => {
    if (!workspaceSnapshot) return null;

    return workspaceSnapshot.artifactIds
      .map((id) => getArtifactSnapshotById(id))
      .filter((el) => !!el);
  }, [workspaceSnapshot, getArtifactSnapshotById]);

  return { artifactSnapshotsForWorkspace };
};
