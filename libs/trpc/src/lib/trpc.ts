import { initTRPC } from '@trpc/server';

import { Context } from './context';
import { customTrpcTransformer } from '@feynote/shared-utils';

const t = initTRPC.context<Context>().create({
  transformer: customTrpcTransformer,
});

export const middleware = t.middleware;
export const router = t.router;
export const publicProcedure = t.procedure;
