import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const getByEmail = authenticatedProcedure
  .input(
    z.object({
      email: z.string().email(),
    }),
  )
  .query(
    async ({
      input,
    }): Promise<{
      id: string;
      name: string;
      email: string;
    }> => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User with that email not found',
        });
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
      };
    },
  );
