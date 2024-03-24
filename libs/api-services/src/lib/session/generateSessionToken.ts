import { randomBytes } from 'crypto';

const TOKEN_LENGTH = 64;

export const generateSessionToken = () => {
  const token = randomBytes(TOKEN_LENGTH).toString('hex');
  console.log(token);
  return token;
};
