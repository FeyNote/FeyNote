import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const deleteMessagesSince = authenticatedProcedure
  .input(
    z.object({
      messageId: z.string(),
      threadId: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const thread = await prisma.thread.findFirst({
      where: { id: input.threadId, userId: ctx.session.userId },
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    const messages = await prisma.message.findMany({
      where: { id: input.threadId },
      orderBy: {
        createdAt: 'desc',
      },
    });
    const messageToDeleteIndex = messages.findIndex(
      (message) => message.id === input.messageId,
    );
    const messageIdsToDelete = messages
      .slice(0, messageToDeleteIndex + 1)
      .map((message) => message.id);
    await prisma.message.deleteMany({
      where: {
        id: {
          in: messageIdsToDelete,
        },
      },
    });
  });
