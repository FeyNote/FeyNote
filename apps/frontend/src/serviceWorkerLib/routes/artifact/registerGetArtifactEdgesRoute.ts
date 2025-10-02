import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { idbEdgeToEdge } from '../../util/idbEdgeToEdge';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerGetArtifactEdgesRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactEdges/,
    async () => {
      const manifestDb = await getManifestDb();

      const edges = await manifestDb.getAll(ObjectStoreName.Edges);

      const result = edges.map(idbEdgeToEdge);

      return encodeCacheResultForTrpc<
        typeof trpc.artifact.getArtifactEdges.query
      >(result);
    },
    'GET',
  );
}
