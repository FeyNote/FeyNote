import { router as trpcRouter } from '../../trpc';
import { getAllForUser } from './getAllForUser';

export const router = trpcRouter({
  getAllForUser,
});
