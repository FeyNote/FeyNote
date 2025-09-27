import { customTrpcTransformer } from '@feynote/shared-utils';
import type { Resolver } from '@trpc/client';

export function encodeCacheResultForTrpc<T extends Resolver<any>>(
  result: Awaited<ReturnType<T>>,
) {
  return new Response(
    JSON.stringify({
      result: {
        data: customTrpcTransformer.serialize(result),
      },
    }),
    {
      headers: {
        swcache: 'true',
        'content-type': 'application/json',
      },
    },
  );
}
