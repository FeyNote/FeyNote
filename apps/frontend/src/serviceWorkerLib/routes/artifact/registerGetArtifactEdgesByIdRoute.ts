import { registerRoute } from 'workbox-routing';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import { idbEdgeToEdge } from '../../util/idbEdgeToEdge';

export function registerGetArtifactEdgesByIdRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactEdgesById/,
    async (event) => {
      // Cache first
      const input =
        getTrpcInputForEvent<typeof trpc.artifact.getArtifactEdgesById.query>(
          event,
        );
      if (!input || !input.id)
        throw new Error('No id provided in procedure input');

      const manifestDb = await getManifestDb();

      const localArtifactVersion = await manifestDb.get(
        ObjectStoreName.ArtifactVersions,
        input.id,
      );
      if (!localArtifactVersion) {
        const response = await fetch(event.request);

        return response;
      }

      const outgoingEdges = await manifestDb.getAllFromIndex(
        ObjectStoreName.Edges,
        'artifactId',
        input.id,
      );
      const incomingEdges = await manifestDb.getAllFromIndex(
        ObjectStoreName.Edges,
        'targetArtifactId',
        input.id,
      );

      return encodeCacheResultForTrpc<
        typeof trpc.artifact.getArtifactEdgesById.query
      >({
        outgoingEdges: outgoingEdges.map(idbEdgeToEdge),
        incomingEdges: incomingEdges.map(idbEdgeToEdge),
      });
    },
    'GET',
  );
}
