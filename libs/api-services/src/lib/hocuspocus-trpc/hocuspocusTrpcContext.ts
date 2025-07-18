import * as trpcExpress from '@trpc/server/adapters/express';
import { Hocuspocus } from '@hocuspocus/server';

export const createContextWithHocuspocus = (hocuspocus: Hocuspocus) => {
  return async function createContext(
    expressContext: trpcExpress.CreateExpressContextOptions,
  ) {
    const { req, res } = expressContext;
    return {
      hocuspocus,
      req,
      res,
    };
  };
};

export type HocuspocusTrpcContext = Awaited<
  ReturnType<Awaited<ReturnType<typeof createContextWithHocuspocus>>>
>;
