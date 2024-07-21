import { router as trpcRouter } from '../../trpc';
import { deleteArtifact } from './deleteArtifact';

export const router = trpcRouter({
  deleteArtifact,
});
