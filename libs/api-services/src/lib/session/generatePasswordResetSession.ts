import { prisma } from '@feynote/prisma/client';
import { generateSessionToken } from './generateSessionToken';
import { generateSessionExpiry } from './generateSessionExpiry';
import {
  PASSWORD_RESET_EXTENDABLE_DAYS,
  PASSWORD_RESET_VALIDITY_DAYS,
} from './constants';

export const generatePasswordResetSession = async (userId: string) => {
  const session = await prisma.session.create({
    data: {
      userId: userId,
      token: generateSessionToken(),
      expiresAt: generateSessionExpiry(PASSWORD_RESET_VALIDITY_DAYS),
      extendableUntil: generateSessionExpiry(PASSWORD_RESET_EXTENDABLE_DAYS),
    },
  });
  return session;
};
