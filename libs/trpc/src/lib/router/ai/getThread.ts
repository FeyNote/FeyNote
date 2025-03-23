import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { ThreadDTO, type ThreadDTOMessage } from '@feynote/global-types';
import { threadSummary } from '@feynote/prisma/types';

export const getThread = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }): Promise<ThreadDTO> => {
    const thread = await prisma.thread.findFirst({
      where: { id: input.id, userId: ctx.session.userId },
      ...threadSummary,
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    const threadDTO = {
      id: thread.id,
      title: thread.title || undefined,
      messages: (thread.messages as unknown as ThreadDTOMessage[])
        .filter(
          (message) =>
            message.json.role === 'user' || message.json.role === 'assistant',
        )
        .map((message) => ({
          id: message.id,
          json: {
            ...message.json,
            createdAt: message.json.createdAt
              ? new Date(message.json.createdAt)
              : undefined,
          },
          createdAt: message.createdAt,
        })),
    };
    return threadDTO satisfies ThreadDTO;
  });
