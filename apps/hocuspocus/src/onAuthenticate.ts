import { onAuthenticatePayload } from '@hocuspocus/server';

import { isSessionExpired } from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';

export async function onAuthenticate(args: onAuthenticatePayload) {
  const session = await prisma.session.findUnique({
    where: {
      token: args.token,
    },
  });
  if (!session) throw new Error('Session not found');

  if (isSessionExpired(session)) {
    throw new Error('Session is expired');
  }

  return {
    userId: session.userId,
  };
}
