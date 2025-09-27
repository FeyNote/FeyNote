import {
  FileStreamDecoder,
  readableStreamToUint8Array,
} from '@feynote/shared-utils';
import { registerRoute } from 'workbox-routing';
import { Queue } from 'workbox-background-sync';
import { getManifestDb, ObjectStoreName, type trpc } from '@feynote/ui-sw';
import { encodeCacheResultForTrpc } from '../../util/encodeCacheResultForTrpc';

export function registerCreateFileRoute(bgSyncQueue: Queue) {
  registerRoute(
    /((https:\/\/api\.feynote\.com)|(\/api))\/trpc\/file\.createFile/,
    async (event) => {
      const clonedRequest = event.request.clone();
      try {
        const response = await fetch(event.request);

        return response;
      } catch (_e) {
        // We need a second instance of the cloned request so we can store it in the bgSyncQueue
        const clonedRequest2 = clonedRequest.clone();
        const blob = await clonedRequest.blob();
        const input = await new FileStreamDecoder(blob.stream()).decode();
        const fileContentsUint8 = await readableStreamToUint8Array(
          input.fileContents,
        );

        await bgSyncQueue.pushRequest({
          request: clonedRequest2,
          metadata: {
            type: 'trpc.file.createFile',
            storedAsId: input.id,
          },
        });

        const manifestDb = await getManifestDb();
        await manifestDb.put(ObjectStoreName.PendingFiles, {
          ...input,
          fileContents: null,
          fileContentsUint8,
        });

        return encodeCacheResultForTrpc<typeof trpc.file.createFile.mutate>({
          id: input.id,
          name: input.fileName,
          mimetype: input.mimetype,
          storageKey: 'UPLOADED_OFFLINE',
        });
      }
    },
    'POST',
  );
}
