import { router as trpcRouter } from '../../trpc';
import { createFile } from './createFile';
import { getFileUrlById } from './getFileUrlById';

export const fileRouter = trpcRouter({
  createFile,
  getFileUrlById,
});
