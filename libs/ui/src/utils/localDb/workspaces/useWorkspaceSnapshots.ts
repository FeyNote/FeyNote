import { useEffect, useMemo, useReducer } from 'react';
import { getWorkspaceSnapshotStore } from './workspaceSnapshotStore';
import {
  getAccessLevelCanEdit,
  getWorkspaceAccessLevel,
} from '@feynote/shared-utils';
import { useSessionContext } from '../../../context/session/SessionContext';

export const useWorkspaceSnapshots = () => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);
  const sessionContext = useSessionContext(true);

  const workspaceSnapshotStore = getWorkspaceSnapshotStore();

  useEffect(() => {
    return workspaceSnapshotStore.listen(triggerRerender);
  }, []);

  return useMemo(
    () => ({
      workspaceSnapshotsLoading: workspaceSnapshotStore.isLoading,
      getWorkspaceSnapshotById: (workspaceId: string) => {
        return workspaceSnapshotStore.getWorkspaceSnapshotById(workspaceId);
      },
      workspaceSnapshots: workspaceSnapshotStore
        .getWorkspaceSnapshots()
        .filter((el) => {
          return !el.meta.deletedAt;
        }),
      editableWorkspaceSnapshots: workspaceSnapshotStore
        .getWorkspaceSnapshots()
        .filter((el) => {
          return (
            !el.meta.deletedAt &&
            getAccessLevelCanEdit(
              getWorkspaceAccessLevel(el, sessionContext?.session.userId),
            )
          );
        }),
      getWorkspaceIdsForArtifactId: (artifactId: string) => {
        return workspaceSnapshotStore.getWorkspaceIdsForArtifactId(artifactId);
      },
      getWorkspaceIdsForThreadId: (threadId: string) => {
        return workspaceSnapshotStore.getWorkspaceIdsForThreadId(threadId);
      },
    }),
    [_rerenderReducerValue],
  );
};
