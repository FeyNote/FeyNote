import { threadSummary } from '@feynote/prisma/types';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import type { FeynoteUIMessage, ThreadDTO } from '@feynote/shared-utils';

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
        .filter((message) => !!message.vercel_json_v5)
        .map((message) => ({
          ...(message.vercel_json_v5 as unknown as FeynoteUIMessage),
          id: message.id,
          updatedAt: message.updatedAt,
        })),
    }));

    return threadDTOs;
  },
);
