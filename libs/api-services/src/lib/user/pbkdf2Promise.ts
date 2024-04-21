import { pbkdf2 } from 'crypto';

export const pbkdf2Promise = (
  password: string,
  salt: string,
): Promise<string> => {
  return new Promise<string>((success, fail) => {
    pbkdf2(password, salt, 10000, 512, 'sha512', (err, hashBuff) => {
      if (err) fail(err);
      else success(hashBuff.toString('base64'));
    });
  });
};
