import { prisma } from '@feynote/prisma/client';
import { generateSessionToken } from './generateSessionToken';
import { generateSessionExpiry } from './generateSessionExpiry';

/*
 * Password reset session validity. Should be kept very short
 */
const PASSWORD_RESET_VALIDITY_DAYS = 1;
/*
 * We do not allow sessions included in reset emails to be extended for security reasons.
 * This noop is included for clarity
 */
const PASSWORD_RESET_EXTENDABLE_DAYS = PASSWORD_RESET_VALIDITY_DAYS;

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
