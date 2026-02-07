import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { updateListCache } from '../../util/updateListCache';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';

export function registerGetJobsRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/job\.getJobs/,
    async (event) => {
      const objectStoreName = ObjectStoreName.Jobs;

      try {
        const response = await fetch(event.request);
        if (response.status >= 200 && response.status < 300) {
          updateListCache(objectStoreName, response.clone());
        }
        return response;
      } catch (e) {
        console.log(`Request failed`, e);

        const manifestDb = await getManifestDb();
        const cachedItems = await manifestDb.getAll(objectStoreName);

        const input =
          getTrpcInputForEvent<typeof trpc.job.getJobs.query>(event);
        const type = input?.type;

        const sortedItems = cachedItems
          .filter((jobSummary) => {
            return type ? jobSummary.type === type : true;
          })
          .sort((a, b) => {
            return b.createdAt.getTime() - a.createdAt.getTime();
          });

        const start = input?.offset || 0;
        const end = input?.limit || 10; // Default limit of jobs returned is 10

        if (end) {
          return encodeCacheResultForTrpc(sortedItems.slice(start, end));
        }
        return encodeCacheResultForTrpc(sortedItems.slice(start));
      }
    },
    'GET',
  );
}
