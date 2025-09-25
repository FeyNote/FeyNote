import { ArtifactSnapshotStoreErrorHandler } from './artifactSnapshots/ArtifactSnapshotStoreErrorHandler';
import { EdgeStoreErrorHandler } from './edges/EdgeStoreErrorHandler';
import { KnownUserStoreErrorHandler } from './knownUsers/KnownUserStoreErrorHandler';

export const LocaldbStoreErrorHandlers = () => {
  return (
    <>
      <ArtifactSnapshotStoreErrorHandler />
      <EdgeStoreErrorHandler />
      <KnownUserStoreErrorHandler />
    </>
  );
};
