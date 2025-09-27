import { customTrpcTransformer } from '@feynote/shared-utils';
import type { Resolver } from '@trpc/client';
import { RouteHandlerCallbackOptions } from 'workbox-core';

export function getTrpcInputForEvent<T extends Resolver<any>>(
  event: RouteHandlerCallbackOptions,
) {
  const encodedInput = event.url.searchParams.get('input');
  if (!encodedInput) return;

  const input = customTrpcTransformer.deserialize(JSON.parse(encodedInput));

  return input as Parameters<T>[0];
}
