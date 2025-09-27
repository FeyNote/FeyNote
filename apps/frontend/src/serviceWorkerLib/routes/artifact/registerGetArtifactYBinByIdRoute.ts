import { registerRoute } from 'workbox-routing';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { IndexeddbPersistence } from 'y-indexeddb';
import { encodeStateAsUpdate, Doc as YDoc } from 'yjs';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerGetArtifactYBinByIdRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getArtifactYBinById/,
    async (event) => {
      // Cache first
      const input =
        getTrpcInputForEvent<typeof trpc.artifact.getArtifactYBinById.query>(
          event,
        );
      if (!input || !input.id)
        throw new Error('No id provided in procedure input');

      const docName = `artifact:${input.id}`;
      const manifestDb = await getManifestDb();
      const manifestArtifactVersion = await manifestDb.get(
        ObjectStoreName.ArtifactVersions,
        input.id,
      );
      if (!manifestArtifactVersion) {
        const response = await fetch(event.request);

        return response;
      }

      const idbPersistence = new IndexeddbPersistence(docName, new YDoc());
      await idbPersistence.whenSynced;

      const yBin = encodeStateAsUpdate(idbPersistence.doc);

      await idbPersistence.destroy();

      return encodeCacheResultForTrpc<
        typeof trpc.artifact.getArtifactYBinById.query
      >({
        yBin,
      });
    },
    'GET',
  );
}
