import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const deleteThread = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const thread = await prisma.thread.delete({
      where: { id: input.id, userId: ctx.session.userId },
    });
    if (!thread) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
  });
