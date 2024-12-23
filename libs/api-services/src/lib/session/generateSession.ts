import { prisma } from '@feynote/prisma/client';
import { generateSessionToken } from './generateSessionToken';
import { generateSessionExpiry } from './generateSessionExpiry';
import { Prisma } from '@prisma/client';
import { SESSION_MAX_VALID_DAYS, SESSION_VALID_DAYS } from './constants';

export const generateSession = async (
  userId: string,
  tx: Prisma.TransactionClient = prisma,
) => {
  const session = await tx.session.create({
    data: {
      userId: userId,
      token: generateSessionToken(),
      expiresAt: generateSessionExpiry(SESSION_VALID_DAYS),
      extendableUntil: generateSessionExpiry(SESSION_MAX_VALID_DAYS),
    },
  });

  return session;
};
