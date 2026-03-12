import { router as trpcRouter } from '../../trpc';
import { createWorkspace } from './createWorkspace';
import { getWorkspaceSnapshotById } from './getWorkspaceSnapshotById';
import { getWorkspaceSnapshots } from './getWorkspaceSnapshots';
import { getWorkspaceYBinById } from './getWorkspaceYBinById';
import { getSafeWorkspaceId } from './getSafeWorkspaceId';
import { getWorkspaceAccessLevel } from './getWorkspaceAccessLevel';
import { removeSelfAsCollaborator } from './removeSelfAsCollaborator';
import { getArtifactSnapshotsByWorkspaceId } from './getArtifactSnapshotsByWorkspaceId';

export const workspaceRouter = trpcRouter({
  createWorkspace,
  getWorkspaceSnapshotById,
  getWorkspaceSnapshots,
  getWorkspaceYBinById,
  getSafeWorkspaceId,
  getWorkspaceAccessLevel,
  removeSelfAsCollaborator,
  getArtifactSnapshotsByWorkspaceId,
});
