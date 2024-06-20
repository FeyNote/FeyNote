import { router as trpcRouter } from '../../trpc';
import { sendMessage } from './sendMessage';
import { getThreads } from './getThreads';
import { getThread } from './getThread';
import { createThread } from './createThread';
import { updateThread } from './updateThread';
import { deleteThread } from './deleteThread';

export const router = trpcRouter({
  sendMessage,
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
});
