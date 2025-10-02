import { registerRoute } from 'workbox-routing';
import { cacheListResponse } from '../../util/cacheListResponse';
import { ObjectStoreName, trpc } from '@feynote/ui-sw';

export function registerGetKnownUsersRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/user\.getKnownUsers/,
    async (event) => {
      return cacheListResponse(
        ObjectStoreName.KnownUsers,
        event,
        trpc.user.getKnownUsers.query,
      );
    },
    'GET',
  );
}
