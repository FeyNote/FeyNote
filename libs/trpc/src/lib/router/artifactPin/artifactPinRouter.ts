import { router as trpcRouter } from '../../trpc';
import { createArtifactPin } from './createArtifactPin';
import { deleteArtifactPin } from './deleteArtifactPin';

export const artifactPinRouter = trpcRouter({
  createArtifactPin,
  deleteArtifactPin,
});
