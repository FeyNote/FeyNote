import { pbkdf2Promise } from './pbkdf2Promise';

export const validatePassword = async (
  password: string,
  hash: string,
  salt: string,
  version: number,
) => {
  switch (version) {
    case 1:
      return hash === (await pbkdf2Promise(password, salt));
    default:
      throw new Error(`Invalid password version of ${version}`);
  }
};
