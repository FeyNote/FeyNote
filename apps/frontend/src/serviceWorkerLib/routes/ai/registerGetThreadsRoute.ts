import { ObjectStoreName, trpc } from '@feynote/ui-sw';
import { cacheListResponse } from '../../util/cacheListResponse';
import { registerRoute } from 'workbox-routing';

export function registerGetThreadsRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/ai\.getThreads/,
    async (event) => {
      return cacheListResponse(
        ObjectStoreName.Threads,
        event,
        trpc.ai.getThreads.query,
      );
    },
    'GET',
  );
}
