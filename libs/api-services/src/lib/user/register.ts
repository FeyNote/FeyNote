import type { SessionDTO } from '@feynote/shared-utils';
import { UserAlreadyExistError } from '../error';
import { generateSession } from '../session/generateSession';
import { generatePasswordHashAndSalt } from './generatePasswordHashAndSalt';
import { prisma } from '@feynote/prisma/client';

export const register = async (email: string, password: string) => {
  const existingUser = await prisma.user.findFirst({
    where: { email },
  });

  if (existingUser) {
    throw new UserAlreadyExistError();
  }

  const { hash, salt, version } = await generatePasswordHashAndSalt(password);

  const session = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        passwordHash: hash,
        passwordSalt: salt,
        passwordVersion: version,
        email,
      },
    });

    const session = await generateSession(user.id, tx);

    return session;
  });

  return {
    token: session.token,
    userId: session.userId,
    email,
  } satisfies SessionDTO;
};
