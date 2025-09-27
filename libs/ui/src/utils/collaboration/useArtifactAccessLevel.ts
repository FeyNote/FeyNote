import { getArtifactAccessLevel } from '@feynote/shared-utils';
import { useMemo } from 'react';
import { Doc as YDoc } from 'yjs';
import { useObserveYArtifactMeta } from './useObserveYArtifactMeta';
import { useObserveYArtifactUserAccess } from './useObserveYArtifactUserAccess';

/**
 * It is recommended to make use of the useCollaborationConnectionAuthorizedScope hook
 * instead of this one if you're dealing with a connection, since that
 * takes into account server authorization and whether the connection will
 * even allow you to edit the doc. This just considers the access map client-side.
 */
export const useArtifactAccessLevel = (
  yDoc: YDoc,
  userId: string | undefined,
) => {
  const artifactMeta = useObserveYArtifactMeta(yDoc);
  const userAccess = useObserveYArtifactUserAccess(yDoc);

  const artifactAccessLevel = useMemo(() => {
    return getArtifactAccessLevel(yDoc, userId);
  }, [artifactMeta.userId, artifactMeta.linkAccessLevel, userAccess]);

  return {
    artifactAccessLevel,
  };
};
