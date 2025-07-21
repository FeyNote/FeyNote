import * as trpcExpress from '@trpc/server/adapters/express';
import { Server } from '@hocuspocus/server';

export const createContextWithHocuspocus = (hocuspocusServer: Server) => {
  return async function createContext(
    expressContext: trpcExpress.CreateExpressContextOptions,
  ) {
    const { req, res } = expressContext;
    return {
      hocuspocusServer,
      req,
      res,
    };
  };
};

export type HocuspocusTrpcContext = Awaited<
  ReturnType<Awaited<ReturnType<typeof createContextWithHocuspocus>>>
>;
