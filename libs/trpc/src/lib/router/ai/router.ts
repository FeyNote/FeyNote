import { router as trpcRouter } from '../../trpc';
import { deleteMessagesSince } from './deleteMessagesSince';
import { getThreads } from './getThreads';
import { getThread } from './getThread';
import { createThread } from './createThread';
import { updateThread } from './updateThread';
import { deleteThread } from './deleteThread';

export const router = trpcRouter({
  deleteMessagesSince,
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
});
