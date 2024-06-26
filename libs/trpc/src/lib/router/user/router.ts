import { router as trpcRouter } from '../../trpc';
import { register } from './register';
import { login } from './login';
import { signInWithGoogle } from './signInWithGoogle';
import { getPreferences } from './getPreferences';
import { setPreferences } from './setPreferences';

export const router = trpcRouter({
  login,
  register,
  signInWithGoogle,
  getPreferences,
  setPreferences,
});
