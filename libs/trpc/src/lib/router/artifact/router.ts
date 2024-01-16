import { router as trpcRouter } from '../../trpc';
import { getArtifactsForUser } from './getArtifactsForUser';

export const router = trpcRouter({
  getArtifactsForUser,
});
