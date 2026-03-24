import { useMemo } from 'react';
import { useSessionContext } from '../../context/session/SessionContext';
import { useCollaborationConnection } from '../collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../localDb/artifactSnapshots/useArtifactSnapshots';
import { useAcceptedIncomingSharedArtifactIds } from './useAcceptedIncomingSharedArtifactIds';
import { useWorkspaceSnapshots } from '../localDb/workspaces/useWorkspaceSnapshots';

export const useInboxArtifactSnapshots = () => {
  const { session } = useSessionContext();
  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const { workspaceSnapshots } = useWorkspaceSnapshots();
  const { artifactSnapshots } = useArtifactSnapshots();
  const { acceptedIncomingSharedArtifactIds } =
    useAcceptedIncomingSharedArtifactIds(connection.yjsDoc);

  const workspaceArtifactIds = useMemo(() => {
    return new Set(workspaceSnapshots.flatMap((el) => el.artifactIds));
  }, [workspaceSnapshots]);

  const inboxArtifactSnapshots = useMemo(() => {
    return artifactSnapshots
      .filter((artifact) => {
        const isMe = artifact.meta.userId === session.userId;
        const isAccepted = acceptedIncomingSharedArtifactIds.has(artifact.id);
        const isWorkspaced = workspaceArtifactIds.has(artifact.id);
        return !isMe && !isAccepted && !isWorkspaced;
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [
    artifactSnapshots,
    workspaceArtifactIds,
    session.userId,
    acceptedIncomingSharedArtifactIds,
  ]);

  return {
    inboxArtifactSnapshots,
  };
};
