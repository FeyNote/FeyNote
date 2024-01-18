import type { AppRouter } from '@dnd-assistant/trpc';
import { createTRPCProxyClient, httpLink } from '@trpc/client';
import superjson from 'superjson';
import { SESSION_ITEM_NAME } from '../app/context/session/types';

export const trpc = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpLink({
      url: '/api/trpc/',
      headers: () => {
        const token = localStorage.getItem(SESSION_ITEM_NAME);
        return {
          Authorization: token ? `Bearer ${token}` : undefined,
        };
      },
    }),
  ],
});
