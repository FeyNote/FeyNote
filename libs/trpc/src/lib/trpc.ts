import * as Sentry from '@sentry/node';
import { initTRPC } from '@trpc/server';

import { Context } from './context';
import { customTrpcTransformer } from '@feynote/shared-utils';

const t = initTRPC.context<Context>().create({
  transformer: customTrpcTransformer,
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure.use(sentryMiddleware);
