import { prisma } from '@feynote/prisma/client';
import { AUTH_RESET_TOKEN_VALIDITY_HOURS } from './constants';
import type { AuthResetTokenType } from '@prisma/client';
import { generateAuthResetTokenExpiry } from './generateAuthResetTokenExpiry';
import { generateAuthResetTokenHex } from './generateAuthResetTokenHex';

export const generateAuthResetToken = async (
  userId: string,
  type: AuthResetTokenType,
) => {
  const authResetToken = await prisma.authResetToken.create({
    data: {
      userId: userId,
      token: generateAuthResetTokenHex(),
      type,
      expiresAt: generateAuthResetTokenExpiry(AUTH_RESET_TOKEN_VALIDITY_HOURS),
    },
  });
  return authResetToken;
};
