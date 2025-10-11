/* eslint @typescript-eslint/no-explicit-any: 0 */

import {
  getManifestDb,
  type FeynoteLocalDB,
  type ObjectStoreName,
} from '@feynote/ui-sw';
import { RouteHandlerCallbackOptions } from 'workbox-core';
import { updateListCache } from './updateListCache';
import { encodeCacheResultForTrpc } from './encodeCacheResultForTrpc';
import type { Resolver } from '@trpc/client';

export async function cacheListResponse<
  T extends ObjectStoreName,
  U extends Resolver<{
    input: void; // This method does not support caching things with custom arguments
    output: FeynoteLocalDB[T]['value'][]; // This method only supports caching things with list responses
    transformer: any;
    errorShape: any;
  }>,
>(objectStoreName: T, event: RouteHandlerCallbackOptions, _resolver: U) {
  try {
    const response = await fetch(event.request);

    if (response.status >= 200 && response.status < 300) {
      updateListCache(objectStoreName, response.clone());
    }

    return response;
  } catch (e) {
    console.log(`Request failed`, e);

    const manifestDb = await getManifestDb();
    const cachedItems = await manifestDb.getAll<T>(objectStoreName);

    return encodeCacheResultForTrpc<U>(cachedItems as Awaited<ReturnType<U>>);
  }
}
