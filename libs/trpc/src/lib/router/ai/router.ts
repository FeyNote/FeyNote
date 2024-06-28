import { router as trpcRouter } from '../../trpc';
import { deleteMessage } from './deleteMessage';
import { getThreads } from './getThreads';
import { getThread } from './getThread';
import { createThread } from './createThread';
import { updateThread } from './updateThread';
import { deleteThread } from './deleteThread';

export const router = trpcRouter({
  deleteMessage,
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
});
