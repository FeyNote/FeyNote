import { publicProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const authenticatedProcedure = publicProcedure.use((opts) => {
  const session = opts.ctx.session;
  if (!session) {
    throw new TRPCError({
      message: 'User must be logged in with a valid session',
      code: 'UNAUTHORIZED',
    });
  }
  return opts.next({
    ctx: {
      session,
    },
  });
});
