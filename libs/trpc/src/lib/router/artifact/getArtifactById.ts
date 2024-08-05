import { authenticatedProcedure } from '../../middleware/authenticatedProcedure';
import { z } from 'zod';
import { prisma } from '@feynote/prisma/client';
import { TRPCError } from '@trpc/server';

export const getArtifactById = authenticatedProcedure
  .input(
    z.object({
      id: z.string(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const artifact = await prisma.artifact.findUnique({
      where: {
        id: input.id,
      },
      select: {
        userId: true,
        yBin: true,
      },
    });

    if (!artifact) {
      throw new TRPCError({
        code: 'NOT_FOUND',
      });
    }
    if (artifact.userId !== ctx.session.userId) {
      throw new TRPCError({
        code: 'FORBIDDEN',
      });
    }

    return artifact;
  });
