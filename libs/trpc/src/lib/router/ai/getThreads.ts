import { ThreadDTO, type ThreadDTOMessage } from '@feynote/global-types';
import { threadSummary } from '@feynote/prisma/types';
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
      messages: (thread.messages as unknown as ThreadDTOMessage[]).map(
        (message) => ({
          id: message.id,
          json: {
            ...message.json,
            createdAt: message.json.createdAt
              ? new Date(message.json.createdAt)
              : undefined,
          },
          createdAt: message.createdAt,
        }),
      ),
    }));

    return threadDTOs satisfies ThreadDTO[];
  },
);
