import { router as trpcRouter } from '../../trpc';
import { createArtifact } from './createArtifact';
import { deleteArtifact } from './deleteArtifact';
import { getArtifactById } from './getArtifactById';

export const router = trpcRouter({
  createArtifact,
  deleteArtifact,
  getArtifactById,
});
