import { router as trpcRouter } from '../../trpc';
import { getArtifactById } from './getArtifactById';
import { getArtifacts } from './getArtifacts';
import { searchArtifactsForSelf } from './searchArtifactsForSelf';
import { updateArtifact } from './updateArtifact';

export const router = trpcRouter({
  getArtifactById,
  getArtifacts,
  searchArtifactsForSelf,
  updateArtifact,
});
