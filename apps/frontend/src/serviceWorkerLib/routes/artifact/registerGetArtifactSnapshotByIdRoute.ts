import { registerRoute } from 'workbox-routing';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import * as Sentry from '@sentry/browser';

export function registerGetArtifactSnapshotByIdRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactSnapshotById/,
    async (event) => {
      // Cache first
      const input =
        getTrpcInputForEvent<
          typeof trpc.artifact.getArtifactSnapshotById.query
        >(event);
      if (!input || !input.id)
        throw new Error('No id provided in procedure input');

      try {
        const manifestDb = await getManifestDb();

        const localArtifactSnapshot = await manifestDb.get(
          ObjectStoreName.ArtifactSnapshots,
          input.id,
        );
        if (!localArtifactSnapshot) {
          return fetch(event.request);
        }

        return encodeCacheResultForTrpc<
          typeof trpc.artifact.getArtifactSnapshotById.query
        >(localArtifactSnapshot);
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return fetch(event.request);
      }
    },
    'GET',
  );
}
