import { onAuthenticatePayload } from '@hocuspocus/server';

import { isSessionExpired } from '@feynote/api-services';
import { prisma } from '@feynote/prisma/client';

export async function onAuthenticate(args: onAuthenticatePayload) {
  try {
    const session = await prisma.session.findUnique({
      where: {
        token: args.token,
      },
    });
    if (!session) {
      console.log('Session not found');
      throw new Error();
    }

    if (isSessionExpired(session)) {
      console.log('Session is expired');
      throw new Error();
    }

    return {
      userId: session.userId,
    };
  } catch (e) {
    console.error(e);

    throw e;
  }
}
