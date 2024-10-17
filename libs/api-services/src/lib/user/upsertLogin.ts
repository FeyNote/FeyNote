import { prisma } from '@feynote/prisma/client';
import { generateSession } from '../session/generateSession';

export const upsertLogin = async (name: string, email: string) => {
  const { session, created } = await prisma.$transaction(async (tx) => {
    const existingUser = await tx.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    let user = existingUser;
    if (!user) {
      user = await tx.user.create({
        data: {
          name,
          email,
        },
      });
    }

    const session = await generateSession(user.id, tx);

    return {
      session,
      created: !existingUser,
    };
  });

  return {
    session,
    created,
  };
};
