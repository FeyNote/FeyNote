import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const deleteMessageUntil = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      threadId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
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
    const messageIdsToDelete = messages
      .slice(0, messageIndex + 1)
      .map((message) => message.id);
    await prisma.message.deleteMany({
      where: {
        id: {
          in: messageIdsToDelete,
        },
      },
    });
    const userMessage = messages[messageIndex];
    return (userMessage.json as any).content || '';
  });
