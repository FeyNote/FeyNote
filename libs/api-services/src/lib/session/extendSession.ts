import { prisma } from '@dnd-assistant/prisma/client';
import { generateSessionExpiry } from './generate-session-expiry';
import { Session } from '@prisma/client';

/**
 * We will only extend a session if it expires within this many days
 */
const EXTEND_IF_EXPIRES_WITHIN_DAYS = 7;
/**
 * When extending a session, it will be valid for this length
 */
const EXTENDED_SESSION_VALID_DAYS = 21;

/**
 * Attempts to extend session if possible, otherwise returns early
 * Only throws on a DB error
 */
export const extendSession = async (session: Session) => {
  if (new Date(session.expiresAt) < new Date()) {
    // Session has already expired, cannot be extended
    return;
  }

  const extensionWindow = new Date();
  extensionWindow.setDate(new Date().getDate() + EXTEND_IF_EXPIRES_WITHIN_DAYS);
  if (new Date(session.expiresAt) > extensionWindow) {
    // Session does not need to be extended, still has more than EXTEND_IF_EXPIRES_WITHIN_DAYS
    return;
  }

  let newExpiry = generateSessionExpiry(EXTENDED_SESSION_VALID_DAYS);
  if (newExpiry > session.extendableUntil) {
    if (session.extendableUntil === session.expiresAt) {
      // Session cannot be extended further - it has already reached it's max extension
      return;
    }
    // Session has almost reached it's max extension, give user their last bit of time
    newExpiry = session.extendableUntil;
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      expiresAt: newExpiry,
    },
  });
};
