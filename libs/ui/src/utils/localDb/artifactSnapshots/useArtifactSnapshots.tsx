import { useEffect, useMemo, useReducer } from 'react';
import { getArtifactSnapshotStore } from './artifactSnapshotStore';

/**
 * Consume all artifacts in the store. Please use useArtifactSnapshot for consuming a singular artifactId.
 */
export const useArtifactSnapshots = () => {
  const [_rerenderReducerValue, triggerRerender] = useReducer((x) => x + 1, 0);

  const artifactSnapshotStore = getArtifactSnapshotStore();

  useEffect(() => {
    return artifactSnapshotStore.listen(triggerRerender);
  }, []);

  return useMemo(
    () => ({
      artifactSnapshotsLoading: artifactSnapshotStore.isLoading,
      getArtifactSnapshotById: (artifactId: string) => {
        return artifactSnapshotStore.getArtifactSnapshotById(artifactId);
      },
      artifactSnapshots: artifactSnapshotStore
        .getArtifactSnapshots()
        .filter((el) => {
          return !el.meta.deletedAt;
        }),
    }),
    [_rerenderReducerValue],
  );
};
