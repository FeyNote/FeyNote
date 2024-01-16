import * as trpcExpress from '@trpc/server/adapters/express';

import { inferAsyncReturnType } from '@trpc/server';
import { prisma } from '@dnd-assistant/prisma';

export const createContext = async (
  expressContext: trpcExpress.CreateExpressContextOptions
) => {
  const innerContext = await getInnerContext(expressContext);
  const { req, res } = expressContext;
  return {
    ...innerContext,
    req,
    res,
  };
};

const getInnerContext = async (
  expressContext: trpcExpress.CreateExpressContextOptions
) => {
  const session = await getSessionFromAuthHeader(
    expressContext.req.headers.authorization
  );
  return {
    session,
  };
};

const getSessionFromAuthHeader = async (authHeader?: string) => {
  if (!authHeader) return null;
  const [, token] = authHeader.split(' ');
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { token },
  });
  return session;
};

export type Context = inferAsyncReturnType<typeof createContext>;
