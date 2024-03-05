import { router as trpcRouter } from '../../trpc';
import { getArtifactsForSelf } from './getArtifactsForSelf';
import { searchArtifactsForSelf } from './searchArtifactsForSelf';

export const router = trpcRouter({
  getArtifactsForSelf,
  searchArtifactsForSelf,
});
