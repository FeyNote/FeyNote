import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { assertJsonIsChatCompletion } from '@feynote/openai';
import { threadSummary } from '@feynote/prisma/types';

export const getThread = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const thread = await prisma.thread.findFirst({
      where: { id: input.id, userId: ctx.session.userId },
      ...threadSummary,
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
    const threadDTO = {
      id: thread.id,
      title: thread.title,
      messages,
    };
    return threadDTO;
  });
