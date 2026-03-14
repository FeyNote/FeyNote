import { useEffect, useReducer } from 'react';
import { getWorkspaceSnapshotStore } from './workspaceSnapshotStore';

export const useWorkspaceSnapshot = (workspaceId: string | undefined) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const workspaceSnapshotStore = getWorkspaceSnapshotStore();

  useEffect(() => {
    if (!workspaceId) return;

    return workspaceSnapshotStore.listenForWorkspaceId(
      workspaceId,
      triggerRerender,
    );
  }, [workspaceId]);

  return {
    isLoading: workspaceSnapshotStore.isLoading,
    workspaceSnapshot: workspaceId
      ? workspaceSnapshotStore.getWorkspaceSnapshotById(workspaceId)
      : undefined,
  };
};
