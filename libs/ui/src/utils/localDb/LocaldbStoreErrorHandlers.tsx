import { AppGlobalIDBErrorHandler } from './AppGlobalIDBErrorHandler';
import { ArtifactSnapshotStoreErrorHandler } from './artifactSnapshots/ArtifactSnapshotStoreErrorHandler';
import { EdgeStoreErrorHandler } from './edges/EdgeStoreErrorHandler';
import { KnownUserStoreErrorHandler } from './knownUsers/KnownUserStoreErrorHandler';
import { PendingFileUploadErrorHandler } from './PendingFileUploadErrorHandler';
import { WorkspaceSnapshotStoreErrorHandler } from './workspaces/WorkspaceSnapshotStoreErrorHandler';

export const LocaldbStoreErrorHandlers = () => {
  return (
    <>
      <AppGlobalIDBErrorHandler />
      <ArtifactSnapshotStoreErrorHandler />
      <EdgeStoreErrorHandler />
      <KnownUserStoreErrorHandler />
      <PendingFileUploadErrorHandler />
      <WorkspaceSnapshotStoreErrorHandler />
    </>
  );
};
