import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { threadSummary } from '@feynote/prisma/types';
import type { FeynoteUIMessage, ThreadDTO } from '@feynote/shared-utils';

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
    const messages = thread.messages.map((message) => ({
      ...(message.json as unknown as FeynoteUIMessage),
      id: message.id,
      updatedAt: message.createdAt,
    }));
    const threadDTO = {
      id: thread.id,
      title: thread.title || undefined,
      messages,
    };
    return threadDTO;
  });
