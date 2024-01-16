import { prisma } from '@dnd-assistant/prisma';
import { generateSessionToken } from './generate-session-token';
import { generateSessionExpiry } from './generate-session-expiry';

/**
 * The initial length of validity for a session
 * The session will expire after this time unless extended
 */
const SESSION_VALID_DAYS = 21;
/**
 * The total length this session can maximally be valid for if extended to it's maximum time.
 * Used to force the user to re-auth at a reasonable interval
 */
const SESSION_MAX_VALID_DAYS = 90;

export const generateSession = async (userId: string) => {
  const session = await prisma.session.create({
    data: {
      userId: userId,
      token: generateSessionToken(),
      expiresAt: generateSessionExpiry(SESSION_VALID_DAYS),
      extendableUntil: generateSessionExpiry(SESSION_MAX_VALID_DAYS),
    },
  });
  return session;
};
