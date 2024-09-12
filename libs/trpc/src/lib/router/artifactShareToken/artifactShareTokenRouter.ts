import { router as trpcRouter } from '../../trpc';
import { createArtifactShareToken } from './createArtifactShareToken';
import { deleteArtifactShareToken } from './deleteArtifactShareToken';

export const artifactShareTokenRouter = trpcRouter({
  createArtifactShareToken,
  deleteArtifactShareToken,
});
