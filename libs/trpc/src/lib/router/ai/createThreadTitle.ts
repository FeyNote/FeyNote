import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { generateAssistantText, AIModel, systemMessage } from '@feynote/openai';
import { threadSummary } from '@feynote/prisma/types';
import type { CoreMessage } from 'ai';

export const createThreadTitle = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }): Promise<string> => {
    const thread = await prisma.thread.findFirst({
      where: { id: input.id, userId: ctx.session.userId },
      ...threadSummary,
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    let messages = thread.messages.map(
      (message) => message.json,
    ) as CoreMessage[];
    messages = [systemMessage.nameGeneration, ...messages];

    const title = await generateAssistantText(messages, AIModel.GPT4_MINI);
    await prisma.thread.update({
      where: { id: thread.id },
      data: {
        title,
      },
    });
    return title;
  });
