import { router as trpcRouter } from '../../trpc';
import { register } from './register';
import { login } from './login';
import { signInWithGoogle } from './signInWithGoogle';
import { getPreferences } from './getPreferences';
import { setPreferences } from './setPreferences';
import { getManifest } from './getManifest';
import { getByEmail } from './getByEmail';
import { getKnownUsers } from './getKnownUsers';

export const userRouter = trpcRouter({
  getByEmail,
  getKnownUsers,
  getManifest,
  login,
  register,
  signInWithGoogle,
  getPreferences,
  setPreferences,
});
