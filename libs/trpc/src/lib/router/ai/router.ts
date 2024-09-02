import { router as trpcRouter } from '../../trpc';
import { deleteMessageUntil } from './deleteMessageUntil';
import { getThreads } from './getThreads';
import { getThread } from './getThread';
import { createThread } from './createThread';
import { updateThread } from './updateThread';
import { deleteThread } from './deleteThread';
import { saveMessage } from './saveMessage';
import { createThreadTitle } from './createThreadTitle';

export const router = trpcRouter({
  deleteMessageUntil,
  createThreadTitle,
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  saveMessage,
});
