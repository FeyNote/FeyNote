import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const createThread = authenticatedProcedure.mutation(async ({ ctx }) => {
  const threads = await prisma.thread.create({
    data: { userId: ctx.session.userId, title: 'New Chat' },
  });
  return threads;
});
