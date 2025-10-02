import { useEffect } from 'react';
import { getArtifactSnapshotStore } from './artifactSnapshotStore';
import { useHandleTRPCErrors } from '../../useHandleTRPCErrors';

/**
 * A tiny component that should be rendered once per app to render errors
 * produced by the snapshot store.
 */
export const ArtifactSnapshotStoreErrorHandler: React.FC = () => {
  const artifactSnapshotStore = getArtifactSnapshotStore();
  const { handleTRPCErrors } = useHandleTRPCErrors();

  useEffect(() => {
    return artifactSnapshotStore.listenForFetchFailure(handleTRPCErrors);
  }, [handleTRPCErrors]);

  return null;
};
