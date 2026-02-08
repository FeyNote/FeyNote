import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { registerRoute } from 'workbox-routing';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';
import { getTrpcInputForEvent } from '../../util/getTrpcInputForEvent';
import { customTrpcTransformer } from '@feynote/shared-utils';

export function registerGetJobsRoute() {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/job\.getJobs/,
    async (event) => {
      const objectStoreName = ObjectStoreName.Jobs;
      const manifestDb = await getManifestDb();
      const input = getTrpcInputForEvent<typeof trpc.job.getJobs.query>(event);

      try {
        const response = await fetch(event.request);
        const isFirstPageOfJobs = !input?.offset;
        if (
          response.status >= 200 &&
          response.status < 300 &&
          isFirstPageOfJobs
        ) {
          const json = await response.clone().json();
          const deserialized = customTrpcTransformer.deserialize(
            json.result.data,
          ) as Awaited<ReturnType<typeof trpc.job.getJobs.query>>;

          const tx = manifestDb.transaction(objectStoreName, 'readwrite');
          const store = tx.objectStore(objectStoreName);
          store.clear();
          for (const item of deserialized.jobs) {
            await store.put(item);
          }
          await tx.done;
        }
        return response;
      } catch (e) {
        console.log(`Request failed`, e);

        const cachedItems = await manifestDb.getAll(objectStoreName);

        const type = input?.type;
        const sortedJobs = cachedItems
          .filter((jobSummary) => {
            return type ? jobSummary.type === type : true;
          })
          .sort((a, b) => {
            return b.createdAt.getTime() - a.createdAt.getTime();
          });

        return encodeCacheResultForTrpc({
          jobs: sortedJobs,
          count: sortedJobs.length,
        });
      }
    },
    'GET',
  );
}
