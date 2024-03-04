import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifactsForSelf } from './getArtifactsForSelf';

export const router = trpcRouter({
  getArtifactById,
  getArtifactsForSelf,
});
