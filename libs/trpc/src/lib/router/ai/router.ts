import { router as trpcRouter } from '../../trpc';
import { sendMessage } from './sendMessage';
import { getThreads } from './getThreads';
import { getThread } from './getThread';
import { createThread } from './createThread';

export const router = trpcRouter({
  sendMessage,
  getThreads,
  getThread,
  createThread,
});
