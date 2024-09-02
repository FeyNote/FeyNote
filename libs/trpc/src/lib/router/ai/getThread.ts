import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import {
  ThreadDTO,
  ThreadDTOMessageSchema,
  threadSummary,
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
    const threadDTO = {
      id: thread.id,
      title: thread.title,
      messages: thread.messages
        .map((message) => ({
          id: message.id,
          role: (message.json as unknown as any).role,
          content: (message.json as unknown as any).content,
          createdAt: message.createdAt,
        }))
        .filter((json) => ThreadDTOMessageSchema.safeParse(json)),
    };
    return threadDTO satisfies ThreadDTO;
  });
