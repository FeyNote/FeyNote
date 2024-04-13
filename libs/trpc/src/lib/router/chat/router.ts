import { router as trpcRouter } from '../../trpc';
import { sendMessage } from './sendMessage';

export const router = trpcRouter({
  sendMessage,
});
