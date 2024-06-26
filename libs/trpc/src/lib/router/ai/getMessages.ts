import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { prisma } from '@feynote/prisma/client';
import { assertJsonIsChatCompletion } from '@feynote/openai';

export const getMessages = authenticatedProcedure
  .input(
    z.object({
      threadId: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const thread = await prisma.thread.findFirst({
      where: { id: input.threadId, userId: ctx.session.userId },
      select: {
        id: true,
        messages: {
          select: {
            id: true,
            json: true,
          },
        },
      },
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    const messages = thread.messages
      .map((message) => {
        const messageJson = message.json;
        assertJsonIsChatCompletion(messageJson);
        return {
          id: message.id,
          role: messageJson.role,
          content: messageJson.content as string,
        };
      })
      .filter(
        (message) => message.role === 'user' || message.role === 'assistant',
      );
    return messages;
  });
