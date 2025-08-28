import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { threadSummary } from '@feynote/prisma/types';
import {
  AIModel,
  generateAssistantText,
  systemMessage,
} from '@feynote/api-services';
import { convertToModelMessages } from 'ai';
import type { FeynoteUIMessage } from '@feynote/shared-utils';

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
    const feynoteUIMessages = thread.messages.map(
      (message) => message.vercelJsonV5 as unknown as FeynoteUIMessage,
    );

    const messages = convertToModelMessages([...feynoteUIMessages]);
    messages.unshift(systemMessage.nameGeneration);
    const { text } = await generateAssistantText(messages, AIModel.GPT4_MINI);
    await prisma.thread.update({
      where: { id: thread.id },
      data: {
        title: text,
      },
    });
    return text;
  });
