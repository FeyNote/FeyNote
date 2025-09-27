import { getManifestDb, type ObjectStoreName } from '@feynote/ui-sw';
import { RouteHandlerCallbackOptions } from 'workbox-core';
import { updateListCache } from './updateListCache';
import { encodeCacheResultForTrpc } from './encodeCacheResultForTrpc';

export async function cacheListResponse(
  objectStoreName: ObjectStoreName,
  event: RouteHandlerCallbackOptions,
) {
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

    return encodeCacheResultForTrpc(cachedItems);
  }
}
