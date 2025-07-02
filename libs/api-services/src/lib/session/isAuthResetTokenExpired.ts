import { AuthResetToken } from '@prisma/client';

export const isAuthResetTokenExpired = (authResetToken: AuthResetToken) => {
  return authResetToken.expiresAt < new Date();
};
