import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { saveAssistantMessages, sendMessageToAssistant } from '@feynote/openai';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const sendMessage = authenticatedProcedure
  .input(
    z.object({
      message: z.string(),
      threadId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const thread = await prisma.thread.findFirst({
      where: { id: input.threadId, userId: ctx.session.userId },
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    const newMessages = await sendMessageToAssistant(
      input.message,
      input.threadId,
    );
    await saveAssistantMessages(newMessages, input.threadId);
    const assistantMessages = newMessages.filter(
      (message) => message.role === 'assistant',
    );
    return assistantMessages;
  });
