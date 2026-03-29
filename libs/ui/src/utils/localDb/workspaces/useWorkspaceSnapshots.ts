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
      /**
       * This method is safe to use as a useMemo dependency
       * This method is safe to be attached to a render cycle without memoization
       */
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
      /**
       * This method is safe to use as a useMemo dependency
       * This method should not be attached to a render cycle - it's results should be memoized
       */
      getWorkspaceIdsForArtifactId: (artifactId: string) => {
        return workspaceSnapshotStore.getWorkspaceIdsForArtifactId(artifactId);
      },
      /**
       * This method is safe to use as a useMemo dependency
       * This method should not be attached to a render cycle - it's results should be memoized
       */
      getWorkspaceIdsForThreadId: (threadId: string) => {
        return workspaceSnapshotStore.getWorkspaceIdsForThreadId(threadId);
      },
    }),
    [_rerenderReducerValue],
  );
};
