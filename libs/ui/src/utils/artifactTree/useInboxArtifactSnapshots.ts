import { useMemo } from 'react';
import { useSessionContext } from '../../context/session/SessionContext';
import { useCollaborationConnection } from '../collaboration/useCollaborationConnection';
import { useArtifactSnapshots } from '../localDb/artifactSnapshots/useArtifactSnapshots';
import { useAcceptedIncomingSharedArtifactIds } from './useAcceptedIncomingSharedArtifactIds';

export const useInboxArtifactSnapshots = () => {
  const { session } = useSessionContext();
  const connection = useCollaborationConnection(`userTree:${session.userId}`);
  const { artifactSnapshots } = useArtifactSnapshots();
  const { acceptedIncomingSharedArtifactIds } =
    useAcceptedIncomingSharedArtifactIds(connection.yjsDoc);

  const inboxArtifactSnapshots = useMemo(() => {
    if (!artifactSnapshots) return [];
    return artifactSnapshots
      .filter(
        (artifact) =>
          artifact.meta.userId !== session.userId &&
          !acceptedIncomingSharedArtifactIds.has(artifact.id),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [artifactSnapshots, session.userId, acceptedIncomingSharedArtifactIds]);

  return {
    inboxArtifactSnapshots,
  };
};
