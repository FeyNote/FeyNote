import type { AppRouter } from '@feynote/trpc';
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import { getApiUrls } from './getApiUrls';
import { appIdbStorageManager } from './AppIdbStorageManager';
import i18next from 'i18next';

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

export { superjson };

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: getApiUrls().trpc,
      headers: async () => {
        const session = await appIdbStorageManager.getSession();
        return {
          Authorization: session?.token ? `Bearer ${session.token}` : undefined,
          'Accept-Language': Array.from(i18next.languages || []),
        };
      },
    }),
  ],
});
