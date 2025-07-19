import { createTRPCProxyClient, httpLink } from '@trpc/client';
import { customTrpcTransformer } from '@feynote/shared-utils';
import type { HocuspocusTrpcAppRouter } from './router';
import { globalServerConfig } from '@feynote/config';

const { internalRestBaseUrl, apiKey } = globalServerConfig.hocuspocus;
const restBaseUrl = internalRestBaseUrl.endsWith('/')
  ? internalRestBaseUrl
  : internalRestBaseUrl + '/';

export const hocuspocusTrpcClient =
  createTRPCProxyClient<HocuspocusTrpcAppRouter>({
    links: [
      httpLink({
        url: restBaseUrl + 'trpc',
        transformer: customTrpcTransformer,
        headers: async () => {
          return {
            Authorization: `Bearer ${apiKey}`,
          };
        },
      }),
    ],
  });
