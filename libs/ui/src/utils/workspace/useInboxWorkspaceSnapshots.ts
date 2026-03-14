import { useMemo } from 'react';
import { useSessionContext } from '../../context/session/SessionContext';
import { useCollaborationConnection } from '../collaboration/useCollaborationConnection';
import { useWorkspaceSnapshots } from '../localDb/workspaces/useWorkspaceSnapshots';
import { useAcceptedIncomingSharedWorkspaceIds } from './useAcceptedIncomingSharedWorkspaceIds';

export const useInboxWorkspaceSnapshots = () => {
  const { session } = useSessionContext();
  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const { workspaceSnapshots } = useWorkspaceSnapshots();
  const { acceptedIncomingSharedWorkspaceIds } =
    useAcceptedIncomingSharedWorkspaceIds(connection.yjsDoc);

  const inboxWorkspaceSnapshots = useMemo(() => {
    return workspaceSnapshots
      .filter((workspace) => {
        const isMe = workspace.meta.userId === session.userId;
        const isAccepted = acceptedIncomingSharedWorkspaceIds.has(workspace.id);
        return !isMe && !isAccepted;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [workspaceSnapshots, session.userId, acceptedIncomingSharedWorkspaceIds]);

  return {
    inboxWorkspaceSnapshots,
  };
};
