import { router as trpcRouter } from '../../trpc';
import { createFile } from './createFile';
import { getFileUrlById } from './getFileUrlById';
import { getSafeFileId } from './getSafeFileId';

export const fileRouter = trpcRouter({
  createFile,
  getFileUrlById,
  getSafeFileId,
});
