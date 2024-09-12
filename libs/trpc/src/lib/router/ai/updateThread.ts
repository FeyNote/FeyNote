import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const updateThread = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string(),
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
      const thread = await prisma.thread.update({
        where: { id: input.id, userId: ctx.session.userId },
        data: {
          title: input.title,
        },
      });
      if (!thread) {
        throw new TRPCError({
          code: 'NOT_FOUND',
        });
      }
      return thread;
    },
  );
