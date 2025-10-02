import { registerRoute } from 'workbox-routing';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import type { trpc } from '@feynote/ui-sw';

export function registerGetSafeFileIdRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/file\.getSafeFileId/,
    async (event) => {
      try {
        const response = await fetch(event.request);

        return response;
      } catch (_e) {
        // When offline we rely on the very low chance of a uuid collision
        const candidateId = crypto.randomUUID();
        return encodeCacheResultForTrpc<typeof trpc.file.getSafeFileId.query>({
          id: candidateId,
        });
      }
    },
    'GET',
  );
}
