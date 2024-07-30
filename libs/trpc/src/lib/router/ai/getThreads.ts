import {
  ThreadDTO,
  ThreadDTOMessageSchema,
  threadSummary,
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
      messages: thread.messages
        .map((message) => ({
          id: message.id,
          role: (message.json as unknown as any).role,
          content: (message.json as unknown as any).content,
        }))
        .filter((json) => ThreadDTOMessageSchema.safeParse(json)),
    }));
    return threadDTOs satisfies ThreadDTO[];
  },
);
