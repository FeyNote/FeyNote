import type { AppRouter } from '@feynote/trpc';
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import { SESSION_ITEM_NAME } from '../app/context/session/types';
import { getApiUrls } from './getApiUrls';

/**
 * SuperJson doesn't serialize Buffers to UInt8Array. Browsers don't have
 * a Buffer implementation, so we serialize to standard
 */
superjson.registerCustom<Uint8Array, number[]>(
  {
    isApplicable: (v): v is Uint8Array => v instanceof Uint8Array,
    serialize: (v) => [...v],
    deserialize: (v) => Uint8Array.from(v),
  },
  'buffer',
);

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: getApiUrls().trpc,
      headers: () => {
        const { token } = JSON.parse(localStorage.getItem(SESSION_ITEM_NAME) || "{}");
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});
