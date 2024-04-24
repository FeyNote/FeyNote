import { router as trpcRouter } from '../../trpc';
import { sendMessage } from './sendMessage';
import { getThreads } from './getThreads';

export const router = trpcRouter({
  sendMessage,
  getThreads,
});
