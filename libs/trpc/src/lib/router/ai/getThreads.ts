import { threadSummary } from '@feynote/prisma/types';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const getThreads = authenticatedProcedure.query(async ({ ctx }) => {
  const threads = await prisma.thread.findMany({
    where: { userId: ctx.session.userId },
    ...threadSummary,
  });
  return threads;
});
