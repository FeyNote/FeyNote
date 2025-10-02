import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerGetSafeArtifactIdRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/artifact\.getSafeArtifactId/,
    async (event) => {
      try {
        const response = await fetch(event.request);

        return response;
      } catch (_e) {
        const manifestDb = await getManifestDb();

        while (true) {
          // We can at least check local artifacts which isn't globally guaranteed but oh well
          const candidateId = crypto.randomUUID();
          const artifact = await manifestDb.get(
            ObjectStoreName.Artifacts,
            candidateId,
          );
          if (!artifact) {
            return encodeCacheResultForTrpc<
              typeof trpc.artifact.getSafeArtifactId.query
            >({ id: candidateId });
          }
        }
      }
    },
    'GET',
  );
}
