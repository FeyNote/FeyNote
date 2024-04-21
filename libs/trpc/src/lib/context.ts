import * as trpcExpress from '@trpc/server/adapters/express';

import { inferAsyncReturnType } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { isSessionExpired } from '@feynote/api-services';

export const createContext = async (
  expressContext: trpcExpress.CreateExpressContextOptions,
) => {
  const session = await getSessionFromAuthHeader(expressContext);
  const { req, res } = expressContext;
  return {
    session,
    req,
    res,
  };
};

const getSessionFromAuthHeader = async (
  expressContext: trpcExpress.CreateExpressContextOptions,
) => {
  const authHeader = expressContext.req.headers.authorization;
  if (!authHeader) return null;
  const [, token] = authHeader.split(' ');
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
  });
  if (!session || isSessionExpired(session)) return null;
  return session;
};

export type Context = inferAsyncReturnType<typeof createContext>;
