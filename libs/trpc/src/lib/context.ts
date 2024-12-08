import * as trpcExpress from '@trpc/server/adapters/express';

import { inferAsyncReturnType } from '@trpc/server';
import { getSessionFromAuthHeader } from '@feynote/api-services';

export const createContext = async (
  expressContext: trpcExpress.CreateExpressContextOptions,
) => {
  const session = await getSessionFromAuthHeader(
    expressContext.req.headers.authorization,
  );
  const { req, res } = expressContext;
  return {
    session,
    req,
    res,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;
