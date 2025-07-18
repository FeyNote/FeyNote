import { globalServerConfig } from '@feynote/config';
import { publicHocuspocusTrpcProcedure } from '../hocuspocusTrpc';
import { TRPCError } from '@trpc/server';

export const authenticatedHocuspocusTrpcProcedure =
  publicHocuspocusTrpcProcedure.use((opts) => {
    const [, key] = opts.ctx.req.headers['authorization']?.split(' ') || [
      '',
      '',
    ];

    if (globalServerConfig.hocuspocus.apiKey !== key) {
      throw new TRPCError({
        message:
          'You must pass a valid token as "Bearer TOKEN" via the Authorization header to access this procedure.',
        code: 'UNAUTHORIZED',
      });
    }

    return opts.next({
      ctx: {},
    });
  });
