import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const updateMessage = authenticatedProcedure
  .input(
    z.object({
      message: z.any(),
      threadId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<void> => {
    const thread = await prisma.thread.findFirst({
      where: { id: input.threadId, userId: ctx.session.userId },
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    const message = await prisma.message.update({
      where: { id: input.message.id },
      data: {
        json: input.message,
      },
    });
    if (!message) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
  });
