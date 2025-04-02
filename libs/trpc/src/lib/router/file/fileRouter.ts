import { router as trpcRouter } from '../../trpc';
import { createFile } from './createFile';
import { getFileUrlById } from './getFileUrlById';
import { getFileUrlByJobId } from './getFileUrlByJobId';

export const fileRouter = trpcRouter({
  createFile,
  getFileUrlById,
  getFileUrlByJobId,
});
