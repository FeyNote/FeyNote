import { initTRPC } from '@trpc/server';

import { HocuspocusTrpcContext } from './context';
import { customTrpcTransformer } from '@feynote/shared-utils';

const t = initTRPC.context<HocuspocusTrpcContext>().create({
  transformer: customTrpcTransformer,
});

export const middleware = t.middleware;
export const router = t.router;
export const publicHocuspocusTrpcProcedure = t.procedure;
