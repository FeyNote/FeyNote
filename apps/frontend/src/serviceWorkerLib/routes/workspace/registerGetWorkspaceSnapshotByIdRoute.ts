import { registerRoute } from 'workbox-routing';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import * as Sentry from '@sentry/browser';

export function registerGetWorkspaceSnapshotByIdRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/workspace\.getWorkspaceSnapshotById/,
    async (event) => {
      const input =
        getTrpcInputForEvent<
          typeof trpc.workspace.getWorkspaceSnapshotById.query
        >(event);
      if (!input || !input.id)
        throw new Error('No id provided in procedure input');

      try {
        const manifestDb = await getManifestDb();

        const localWorkspaceSnapshot = await manifestDb.get(
          ObjectStoreName.WorkspaceSnapshots,
          input.id,
        );
        if (!localWorkspaceSnapshot) {
          return fetch(event.request);
        }

        return encodeCacheResultForTrpc<
          typeof trpc.workspace.getWorkspaceSnapshotById.query
        >(localWorkspaceSnapshot);
      } catch (e) {
        console.error(e);
        Sentry.captureException(e);
        return fetch(event.request);
      }
    },
    'GET',
  );
}
