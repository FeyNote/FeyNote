import { router as trpcRouter } from '../../trpc';
import { upsertArtifactShare } from './upsertArtifactShare';
import { deleteArtifactShare } from './deleteArtifactShare';

export const artifactShareRouter = trpcRouter({
  upsertArtifactShare,
  deleteArtifactShare,
});
