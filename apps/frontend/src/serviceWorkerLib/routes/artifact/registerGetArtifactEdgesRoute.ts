import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { idbEdgeToEdge } from '../../util/idbEdgeToEdge';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import * as Sentry from '@sentry/browser';

export function registerGetArtifactEdgesRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactEdges/,
    async (event) => {
      try {
        const manifestDb = await getManifestDb();

        const edges = await manifestDb.getAll(ObjectStoreName.Edges);

        const result = edges.map(idbEdgeToEdge);

        return encodeCacheResultForTrpc<
          typeof trpc.artifact.getArtifactEdges.query
        >(result);
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return fetch(event.request);
      }
    },
    'GET',
  );
}
