import { router as trpcRouter } from '../../trpc';
import { getArtifactsForSelf } from './getArtifactsForSelf';

export const router = trpcRouter({
  getArtifactsForSelf: getArtifactsForSelf,
});
