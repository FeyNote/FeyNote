import { router as trpcRouter } from '../../trpc';
import { getMessages } from './getMessages';
import { deleteMessage } from './deleteMessage';
import { getThreads } from './getThreads';
import { getThread } from './getThread';
import { createThread } from './createThread';
import { updateThread } from './updateThread';
import { deleteThread } from './deleteThread';

export const router = trpcRouter({
  getMessages,
  deleteMessage,
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
});
