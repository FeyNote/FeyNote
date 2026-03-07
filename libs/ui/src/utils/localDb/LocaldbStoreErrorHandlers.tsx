import { ArtifactSnapshotStoreErrorHandler } from './artifactSnapshots/ArtifactSnapshotStoreErrorHandler';
import { EdgeStoreErrorHandler } from './edges/EdgeStoreErrorHandler';
import { KnownUserStoreErrorHandler } from './knownUsers/KnownUserStoreErrorHandler';
import { WorkspaceSnapshotStoreErrorHandler } from './workspaces/WorkspaceSnapshotStoreErrorHandler';

export const LocaldbStoreErrorHandlers = () => {
  return (
    <>
      <ArtifactSnapshotStoreErrorHandler />
      <EdgeStoreErrorHandler />
      <KnownUserStoreErrorHandler />
      <WorkspaceSnapshotStoreErrorHandler />
    </>
  );
};
