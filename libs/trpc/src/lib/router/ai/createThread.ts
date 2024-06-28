import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const createThread = authenticatedProcedure
  .input(
    z.object({
      title: z.string(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const threads = await prisma.thread.create({
      data: { userId: ctx.session.userId, title: input.title },
    });
    return threads;
  });
