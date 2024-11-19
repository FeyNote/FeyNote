import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const deleteMessageToId = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      threadId: z.string(),
      inclusive: z.boolean().optional(),
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
    const messages = await prisma.message.findMany({
      where: { threadId: input.threadId },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const messageIndex = messages.findIndex(
      (message) => message.id === input.id,
    );
    if (input.inclusive) messageIndex + 1;
    const messageIdsToDelete = messages
      .slice(0, messageIndex)
      .map((message) => message.id);
    await prisma.message.deleteMany({
      where: {
        id: {
          in: messageIdsToDelete,
        },
      },
    });
  });
