import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifactsForSelf } from './getArtifactsForSelf';
import { searchArtifactsForSelf } from './searchArtifactsForSelf';
import { updateArtifact } from './updateArtifact';

export const router = trpcRouter({
  getArtifactById,
  getArtifactsForSelf,
  searchArtifactsForSelf,
  updateArtifact,
});
