import { useMemo } from 'react';
import { useCurrentWorkspaceId } from './useCurrentWorkspaceId';
import { useWorkspaceSnapshots } from '../localDb/workspaces/useWorkspaceSnapshots';

export const useCurrentWorkspaceArtifactIds =
  (): ReadonlySet<string> | null => {
    const { currentWorkspaceId } = useCurrentWorkspaceId();
    const { getWorkspaceSnapshotById } = useWorkspaceSnapshots();

    return useMemo(() => {
      if (!currentWorkspaceId) return null;

      const snapshot = getWorkspaceSnapshotById(currentWorkspaceId);
      if (!snapshot) return null;

      return new Set(snapshot.artifactIds);
    }, [currentWorkspaceId, getWorkspaceSnapshotById]);
  };
