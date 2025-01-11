import { router as trpcRouter } from '../../trpc';
import { getArtifactCollections } from './getArtifactCollections';
import { upsertArtifactCollection } from './upsertArtifactCollection';

export const artifactCollectionRouter = trpcRouter({
  getArtifactCollections,
  upsertArtifactCollection,
});
