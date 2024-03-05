import { prisma } from '@dnd-assistant/prisma/client';
import { generateSession } from '../session/generateSession';

export const upsertLogin = async (email: string) => {
  const user = await prisma.user.upsert({
    where: {
      email,
    },
    create: {
      email,
    },
    update: {},
  });
  const session = await generateSession(user.id);
  return session;
};
