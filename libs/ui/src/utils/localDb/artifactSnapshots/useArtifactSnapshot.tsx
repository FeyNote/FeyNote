import { useEffect, useReducer } from 'react';
import { getArtifactSnapshotStore } from './artifactSnapshotStore';

/**
 * Consume a single artifact snapshot in the store.
 */
export const useArtifactSnapshots = (artifactId: string) => {
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
