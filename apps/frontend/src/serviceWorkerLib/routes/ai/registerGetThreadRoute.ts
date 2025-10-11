import { ObjectStoreName, trpc } from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { cacheSingleResponse } from '../../util/cacheSingleResponse';

export function registerGetThreadRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/ai\.getThread/,
    async (event) => {
      return cacheSingleResponse(
        ObjectStoreName.Threads,
        event,
        trpc.ai.getThread.query,
      );
    },
    'GET',
  );
}
