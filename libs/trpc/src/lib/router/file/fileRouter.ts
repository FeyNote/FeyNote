import { router as trpcRouter } from '../../trpc';
import { createFile } from './createFile';
import { getFileUrlById } from './getFileUrlById';
import { getFileUrlByJobId } from './getFileUrlByJobId';
import { getSafeFileId } from './getSafeFileId';

export const fileRouter = trpcRouter({
  createFile,
  getFileUrlById,
  getFileUrlByJobId,
  getSafeFileId,
});
