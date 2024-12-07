import crypto from 'crypto';

export function generateS3Key() {
  const rand = crypto.randomBytes(10).toString('hex');
  const key = `${Date.now()}-${rand}`;

  return key;
}
