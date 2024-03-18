import { Session } from '@prisma/client';

export const isSessionExpired = (session: Session) => {
  return session.expiresAt < new Date();
};
