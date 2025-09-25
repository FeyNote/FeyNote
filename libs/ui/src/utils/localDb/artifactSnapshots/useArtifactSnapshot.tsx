import { useEffect, useReducer } from 'react';
import { getArtifactSnapshotStore } from './artifactSnapshotStore';

/**
 * Consume a single artifact snapshot in the store.
 * NOTE: This does not fetch a snapshot from the server, so if you're looking for
 * content not within a user's collection, this does not do that.
 */
export const useArtifactSnapshot = (artifactId: string) => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const artifactSnapshotStore = getArtifactSnapshotStore();

  useEffect(() => {
    return artifactSnapshotStore.listenForArtifactId(
      artifactId,
      triggerRerender,
    );
  }, []);

  return {
    isLoading: artifactSnapshotStore.isLoading,
    artifactSnapshot: artifactSnapshotStore.getArtifactSnapshotById(artifactId),
  };
};
