import { useEffect } from 'react';
import { getWorkspaceSnapshotStore } from './workspaceSnapshotStore';
import { useHandleTRPCErrors } from '../../useHandleTRPCErrors';

export const WorkspaceSnapshotStoreErrorHandler: React.FC = () => {
  const workspaceSnapshotStore = getWorkspaceSnapshotStore();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  useEffect(() => {
    return workspaceSnapshotStore.listenForFetchFailure(handleTRPCErrors);
  }, [handleTRPCErrors]);

  return null;
};
