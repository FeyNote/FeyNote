import { randomBytes } from 'crypto';
import { SESSION_TOKEN_LENGTH_BYTES } from './constants';

export const generateSessionToken = () => {
  const token = randomBytes(SESSION_TOKEN_LENGTH_BYTES).toString('hex');
  return token;
};
