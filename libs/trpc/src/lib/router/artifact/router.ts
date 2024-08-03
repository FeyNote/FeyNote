import { router as trpcRouter } from '../../trpc';
import { createArtifact } from './createArtifact';
import { deleteArtifact } from './deleteArtifact';

export const router = trpcRouter({
  createArtifact,
  deleteArtifact,
});
