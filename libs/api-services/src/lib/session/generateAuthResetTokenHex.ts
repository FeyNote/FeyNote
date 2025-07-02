import { randomBytes } from 'crypto';
import { AUTH_RESET_TOKEN_LENGTH_BYTES } from './constants';

export const generateAuthResetTokenHex = () => {
  const token = randomBytes(AUTH_RESET_TOKEN_LENGTH_BYTES).toString('hex');
  return token;
};
