import { router as trpcRouter } from '../../trpc';
import { deleteMessageToId } from './deleteMessageToId';
import { getThreads } from './getThreads';
import { getThread } from './getThread';
import { createThread } from './createThread';
import { updateThread } from './updateThread';
import { deleteThread } from './deleteThread';
import { saveMessage } from './saveMessage';
import { updateMessage } from './updateMessage';
import { createThreadTitle } from './createThreadTitle';
import { autofill } from './autofill';

export const aiRouter = trpcRouter({
  deleteMessageToId,
  createThreadTitle,
  getThreads,
  getThread,
  createThread,
  updateThread,
  deleteThread,
  saveMessage,
  updateMessage,
  autofill,
});
