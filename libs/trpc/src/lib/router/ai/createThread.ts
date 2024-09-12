import { z } from 'zod';
import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';

export const createThread = authenticatedProcedure
  .input(
    z.object({
      title: z.string().optional(),
    }),
  )
  .mutation(
    async ({
      ctx,
      input,
    }): Promise<{
      id: string;
      title: string | null;
      userId: string;
      createdAt: Date;
      updatedAt: Date;
    }> => {
      const threads = await prisma.thread.create({
        data: { userId: ctx.session.userId, title: input.title || undefined },
      });
      return threads;
    },
  );
