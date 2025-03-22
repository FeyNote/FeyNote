import type { AppRouter } from '@feynote/trpc';
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import { getApiUrls } from './getApiUrls';
import { appIdbStorageManager } from './AppIdbStorageManager';
import i18next from 'i18next';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpLink({
      url: getApiUrls().trpc,
      transformer: superjson,
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
