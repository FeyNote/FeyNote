import { prisma } from '@feynote/prisma/client';
import { hashPassword } from './hashPassword';
import {
  InvalidCredentialsError,
  UserNoPasswordError,
  UserNotFoundError,
} from '../error';
import { generateSession } from '../session/generateSession';
import type { SessionDTO } from '@feynote/shared-utils';

export const login = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  if (!user.passwordSalt || !user.passwordHash || !user.passwordVersion) {
    throw new UserNoPasswordError();
  }

  const hash = await hashPassword(password, user.passwordSalt);

  if (hash !== user.passwordHash) {
    throw new InvalidCredentialsError();
  }

  const session = await generateSession(user.id);

  return {
    token: session.token,
    userId: session.userId,
    email: email,
  } satisfies SessionDTO;
};
