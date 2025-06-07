import type { SessionDTO } from '@feynote/shared-utils';
import { UserAlreadyExistError } from '../error';
import { generateSession } from '../session/generateSession';
import { generatePasswordHashAndSalt } from './generatePasswordHashAndSalt';
import { prisma } from '@feynote/prisma/client';

export const register = async (
  name: string,
  email: string,
  password: string,
) => {
  const existingUser = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new UserAlreadyExistError();
  }

  const { hash, salt, version } = await generatePasswordHashAndSalt(password);

  const session = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        passwordHash: hash,
        passwordSalt: salt,
        passwordVersion: version,
        email: email.toLowerCase(),
      },
    });

    const session = await generateSession(user.id, tx);

    return session;
  });

  return {
    id: session.id,
    token: session.token,
    userId: session.userId,
    email: email.toLowerCase(),
  } satisfies SessionDTO;
};
