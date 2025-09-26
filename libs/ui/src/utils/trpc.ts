import type { AppRouter } from '@feynote/trpc';
import { createTRPCProxyClient, httpLink, loggerLink } from '@trpc/client';
import { getApiUrls } from './getApiUrls';
import { appIdbStorageManager } from './AppIdbStorageManager';
import i18next from 'i18next';
import { customTrpcTransformer } from '@feynote/shared-utils';
import { captureTrpcRequest } from './debugStore';

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    loggerLink({
      console: {
        log: (...args) => {
          const info = {
            methodInfo: args[0],
            elapsedMs: args[1]?.elapsedMs,
            input: args[1]?.input,
            result: {
              response: {
                code: args[1]?.result?.context?.response?.status,
                ok: args[1]?.result?.context?.response?.ok,
                redirected: args[1]?.result?.context?.response?.redirected,
                type: args[1]?.result?.context?.response?.type,
                url: args[1]?.result?.context?.response?.url,
                headers: Object.fromEntries(
                  args[1]?.result?.context?.response?.headers?.entries() || [],
                ),
              },
              resultType: args[1]?.result?.result?.type,
            },
          };
          captureTrpcRequest(info);
        },
        error: (...args) => {
          const info = {
            methodInfo: args[0],
            elapsedMs: args[1]?.elapsedMs,
            input: args[1]?.input,
            result: {
              response: {
                code: args[1]?.result?.meta?.response?.status,
                ok: args[1]?.result?.meta?.response?.ok,
                redirected: args[1]?.result?.meta?.response?.redirected,
                type: args[1]?.result?.meta?.response?.type,
                url: args[1]?.result?.meta?.response?.url,
                headers: Object.fromEntries(
                  args[1]?.result?.meta?.response?.headers?.entries() || [],
                ),
              },
              error: {
                name: args[1]?.result?.name,
                message: args[1]?.result?.message,
                cause: args[1]?.result?.cause,
                lineNumber: args[1]?.result?.lineNumber,
                columnNumber: args[1]?.result?.columnNumber,
                fileName: args[1]?.result?.fileName,
                data: args[1]?.result?.data,
                stack: args[1]?.result?.stack,
                shape: args[1]?.result?.shape,
              },
              resultType: 'error',
            },
          };
          captureTrpcRequest(info);
        },
      },
      enabled: (opts) => {
        return opts.direction === 'down';
      },
      colorMode: 'none',
    }),
    httpLink({
      url: getApiUrls().trpc,
      transformer: customTrpcTransformer,
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
