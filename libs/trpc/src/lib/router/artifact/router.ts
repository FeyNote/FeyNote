import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifactsForSelf } from './getArtifactsForSelf';
import { searchArtifactsForSelf } from './searchArtifactsForSelf';

export const router = trpcRouter({
  getArtifactById,
  getArtifactsForSelf,
  searchArtifactsForSelf,
});
