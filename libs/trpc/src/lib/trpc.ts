import * as Sentry from '@sentry/node';
import { initTRPC } from '@trpc/server';

import { Context } from './context';
import superjson from 'superjson';

/**
 * SuperJson doesn't serialize Buffers to UInt8Array. Browsers don't have
 * a Buffer implementation, so we serialize to standard
 */
superjson.registerCustom<Buffer, number[]>(
  {
    isApplicable: (v): v is Buffer => v instanceof Buffer,
    serialize: (v) => [...v],
    deserialize: (v) => Buffer.from(v),
  },
  'buffer',
);

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure.use(sentryMiddleware);
