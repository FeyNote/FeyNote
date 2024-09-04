import {
  ThreadDTO,
  threadSummary,
  type ThreadDTOMessage,
} from '@feynote/prisma/types';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const getThreads = authenticatedProcedure.query(
  async ({ ctx }): Promise<ThreadDTO[]> => {
    const threads = await prisma.thread.findMany({
      where: { userId: ctx.session.userId },
      ...threadSummary,
    });

    const threadDTOs = threads.map((thread) => ({
      id: thread.id,
      title: thread.title || undefined,
      messages: thread.messages as unknown as ThreadDTOMessage[],
    }));

    return threadDTOs satisfies ThreadDTO[];
  },
);
