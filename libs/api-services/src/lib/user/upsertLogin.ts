import { prisma } from '@feynote/prisma/client';
import { generateSession } from '../session/generateSession';
import { generateEmptyManifest } from './generateEmptyManifest';

export const upsertLogin = async (email: string) => {
  const user = await prisma.user.upsert({
    where: {
      email,
    },
    create: {
      email,
      yManifestBin: generateEmptyManifest(),
    },
    update: {},
  });
  const session = await generateSession(user.id);
  return session;
};
