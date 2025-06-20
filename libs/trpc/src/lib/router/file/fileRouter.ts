import { router as trpcRouter } from '../../trpc';
import { createFile } from './createFile';
import { getFileUrlById } from './getFileUrlById';
import { getFileUrlsByJobId } from './getFileUrlsByJobId';
import { getSafeFileId } from './getSafeFileId';

export const fileRouter = trpcRouter({
  createFile,
  getFileUrlById,
  getFileUrlsByJobId,
  getSafeFileId,
});
