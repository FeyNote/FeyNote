import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifactsForUser } from './getArtifactsForUser';

export const router = trpcRouter({
  getArtifactsForUser,
  getArtifactById,
});
