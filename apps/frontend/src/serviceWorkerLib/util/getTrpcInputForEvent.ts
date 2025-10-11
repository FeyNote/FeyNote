import { customTrpcTransformer } from '@feynote/shared-utils';
import type { Resolver } from '@trpc/client';
import { RouteHandlerCallbackOptions } from 'workbox-core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getTrpcInputForEvent<T extends Resolver<any>>(
  event: RouteHandlerCallbackOptions,
) {
  const encodedInput = event.url.searchParams.get('input');
  if (!encodedInput) return;

  const input = customTrpcTransformer.deserialize(JSON.parse(encodedInput));

  return input as Parameters<T>[0];
}
