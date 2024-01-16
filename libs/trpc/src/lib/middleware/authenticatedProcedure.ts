import { publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const authenticatedProcedure = publicProcedure.use((opts) => {
  const session = opts.ctx.session;
  if (!session) {
    throw new TRPCError({
      message:
        'You must pass a valid token as "Bearer TOKEN" via the Authorization header to access this procedure.',
      code: 'UNAUTHORIZED',
    });
  }
  return opts.next({
    ctx: {
      session,
    },
  });
});
