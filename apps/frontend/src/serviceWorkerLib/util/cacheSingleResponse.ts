/* eslint @typescript-eslint/no-explicit-any: 0 */

import {
  getManifestDb,
  type FeynoteLocalDB,
  type ObjectStoreName,
} from '@feynote/ui-sw';
import { RouteHandlerCallbackOptions } from 'workbox-core';
import { updateSingleCache } from './updateSingleCache';
import { getTrpcInputForEvent } from './getTrpcInputForEvent';
import { encodeCacheResultForTrpc } from './encodeCacheResultForTrpc';
import type { Resolver } from '@trpc/client';

export async function cacheSingleResponse<
  T extends ObjectStoreName,
  U extends Resolver<{
    input: {
      id: string; // This method only supports caching things with a defined ID as input
    };
    output: FeynoteLocalDB[T]['value'];
    transformer: any;
    errorShape: any;
  }>,
>(dbName: T, event: RouteHandlerCallbackOptions, _resolver: U) {
  try {
    const response = await fetch(event.request);

    if (response.status >= 200 && response.status < 300) {
      updateSingleCache(dbName, response.clone());
    }

    return response;
  } catch (e) {
    console.log(`Request failed`, e);

    const input = getTrpcInputForEvent<U>(event);
    if (!input || !input.id) throw e;

    const manifestDb = await getManifestDb();
    const cachedItem = await manifestDb.get(dbName, input.id);

    return encodeCacheResultForTrpc(cachedItem);
  }
}
