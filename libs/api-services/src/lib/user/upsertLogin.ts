import { prisma } from '@feynote/prisma/client';
import { generateSession } from '../session/generateSession';

export const upsertLogin = async (name: string, email: string) => {
  const user = await prisma.user.upsert({
    where: {
      email,
    },
    create: {
      name,
      email,
    },
    update: {},
  });
  const session = await generateSession(user.id);
  return session;
};
