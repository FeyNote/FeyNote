import { prisma } from '@feynote/prisma/client';
import { Session } from '@prisma/client';
import { isSessionExpired } from './isSessionExpired';
import { extendSession } from './extendSession';
import * as Sentry from '@sentry/node';

export const getSessionFromAuthHeader = async (
  authHeader: string | undefined,
): Promise<Session | null> => {
  if (!authHeader) return null;

  const [, token] = authHeader.split(' ');
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
  });
  if (!session || isSessionExpired(session)) return null;

  // We do not want to increase the latency of the request by waiting for the database
  // write to occur
  extendSession(session).catch((err) => {
    Sentry.captureException(err);
    console.error('Failed to extend session', err);
  });

  return session;
};
