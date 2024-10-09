import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import {
  ThreadDTO,
  threadSummary,
  type ThreadDTOMessage,
} from '@feynote/prisma/types';

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
    console.log(thread.messages);
    const threadDTO = {
      id: thread.id,
      title: thread.title || undefined,
      messages: (thread.messages as unknown as ThreadDTOMessage[]).filter(
        (message) =>
          message.json.role === 'user' || message.json.role === 'assistant',
      ),
    };
    return threadDTO satisfies ThreadDTO;
  });
