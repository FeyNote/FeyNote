import { router as trpcRouter } from '../../trpc';
import { createFile } from './createFile';

export const fileRouter = trpcRouter({
  createFile,
});
